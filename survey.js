'use strict'

// HELPERS
function inject({ tag, scope = 'head', ...properties }) {
    const e = document.createElement(tag)

    Object.entries(properties).forEach(([key, value]) => {
        e.setAttribute(key, value)
    })

    document[scope].appendChild(e)

    return e
}

// DEFAULT VALUES
const DEFAULT_FORM_VALUES = {
    name: '',
    email: '',
    age: '',
    gender: '',
    favoriteBook: '',
    favoriteColors: [],
}

const DEFAULT_CACHE = {
    form: DEFAULT_FORM_VALUES,
    step: 0,
    errors: {},
    status: 'processing',
}

const ERRORS = {
    required: 'Is Required!',
}

// Utils
const steps = ['Identity', 'Details', 'Favorites', 'Summary']

function getStepContent(step) {
    switch (step) {
        case 0:
            return IdentityForm
        case 1:
            return DetailsForm
        case 2:
            return FavoritesForm
        case 3:
            return Summary
        default:
            throw new Error('Unknown step')
    }
}

function getFieldsEmpty(data = {}) {
    return Object.entries(data)
        .map(([key, value]) => {
            if (typeof value === 'string' && value.trim()) return false
            if (typeof value === 'number' && !isNaN(value)) return false
            if (Array.isArray(value) && !!value.length) return false

            return key
        })
        .filter((x) => !!x)
}

/*!
 * Deep merge two or more objects together.
 * (c) 2019 Chris Ferdinandi, MIT License, https://gomakethings.com
 * https://vanillajstoolkit.com/helpers/deepmerge/
 * @param   {Object}   objects  The objects to merge together
 * @returns {Object}            Merged values of defaults and options
 */
const deepMerge = function () {
    // Setup merged object
    var newObj = {}

    // Merge the object into the newObj object
    var merge = function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                // If property is an object, merge properties
                if (
                    Object.prototype.toString.call(obj[prop]) ===
                    '[object Object]'
                ) {
                    newObj[prop] = deepMerge(newObj[prop], obj[prop])
                } else {
                    newObj[prop] = obj[prop]
                }
            }
        }
    }

    // Loop through each object and conduct a merge
    for (var i = 0; i < arguments.length; i++) {
        merge(arguments[i])
    }

    return newObj
}

const cacheService = {
    save: (data = {}) => {
        const loaded = JSON.parse(localStorage.getItem('@survey') || '{}')
        const cache = deepMerge(DEFAULT_CACHE, deepMerge(loaded, data))

        localStorage.setItem('@survey', JSON.stringify(cache))
    },
    load: () => {
        const cacheLoad = JSON.parse(localStorage.getItem('@survey') || '{}')

        return deepMerge(DEFAULT_CACHE, cacheLoad)
    },
}

// SCRIPT
function Main() {
    const { Modal, Box, Fade, Container } = MaterialUI

    const [open, setOpen] = React.useState(true)

    React.useEffect(() => {
        const cache = cacheService.load()

        if (cache.status === 'submitted') setOpen(false)
    }, [])

    const handleOnClose = () => {
        setOpen(false)
    }

    return React.createElement(React.Fragment, {}, [
        React.createElement(
            Modal,
            { open, onClose: handleOnClose, closeAfterTransition: true },
            React.createElement(
                Fade,
                { in: open },

                React.createElement(
                    Container,
                    { component: 'div', maxWidth: 'sm', sx: { mb: 4 } },
                    React.createElement(
                        Box,
                        {
                            sx: {
                                my: { xs: 4, md: 6 },
                                p: { xs: 2, md: 3 },
                                bgcolor: 'background.paper',
                                boxShadow: 24,
                            },
                        },
                        React.createElement(SurveryForm, {
                            onFinish: () => setOpen(false),
                        })
                    )
                )
            )
        ),
    ])
}

// Componentes

//// FORM
function SurveryForm({ onFinish }) {
    const { Box, Stepper, Step, StepLabel, Button, Typography } = MaterialUI

    const [activeStep, setActiveStep] = React.useState(0)
    const [formValues, setFormValues] = React.useState(DEFAULT_FORM_VALUES)
    const [errors, setErrors] = React.useState({})

    React.useEffect(() => {
        const cache = cacheService.load()

        setFormValues(cache.form || DEFAULT_FORM_VALUES)
        setActiveStep(cache.step)
        setErrors(cache.errors)

        validateByStep(cache.form, cache.step)
    }, [])

    const handleNext = () => {
        const valid = validateByStep(formValues, activeStep)

        if (!valid) return
        if (!(activeStep + 1 < steps.length)) return

        const newStep = activeStep + 1

        setActiveStep(newStep)
        saveStepCache(newStep)
    }

    const handleBack = () => {
        if (activeStep - 1 >= 0) {
            const newStep = activeStep - 1
            setActiveStep(newStep)
            saveStepCache(newStep)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        saveSubmitStatusCache()
        onFinish()
    }

    const handleUpdateForm = (field, value) => {
        setFormValues((prev) => {
            const newState = Object.assign({}, prev, { [field]: value })

            saveFormCache(newState)

            return newState
        })
    }

    const reportError = (field, value) => {
        setErrors((prev) => {
            const newState = {
                ...prev,
                [activeStep]: {
                    ...prev[activeStep],
                    [field]: value,
                },
            }

            saveErrorCache(newState)

            return newState
        })
    }

    const cleanErrors = () => {
        setErrors({})
    }

    const saveFormCache = (form) => {
        cacheService.save({ form })
    }

    const saveStepCache = (step) => {
        cacheService.save({ step })
    }

    const saveErrorCache = (errors) => {
        cacheService.save({ errors })
    }

    const saveSubmitStatusCache = (submitted = true) => {
        cacheService.save({ status: submitted ? 'submitted' : 'processing' })
    }

    const validateByStep = (form, step) => {
        const formByStep = {
            0: {
                name: form.name,
                email: form.email,
            },
            1: {
                age: form.age,
                gender: form.gender,
            },
            2: {
                favoriteBook: form.favoriteBook,
                favoriteColors: form.favoriteColors,
            },
        }

        // CHECK FIELDS EMPTY THAT IS REQUIRED
        if (step > 0) {
            const fieldsEmpty = getFieldsEmpty(formByStep[step])

            if (fieldsEmpty.length) {
                fieldsEmpty.forEach((field) =>
                    reportError(field, ERRORS.required)
                )

                return false
            }
        }

        cleanErrors()

        return true
    }

    return React.createElement(
        Box,
        { component: 'form', onSubmit: handleSubmit },
        [
            React.createElement(
                Typography,
                { component: 'h1', variant: 'h4', align: 'center' },
                'Survey'
            ),

            React.createElement(
                Stepper,
                { activeStep, sx: { pt: 3, pb: 5 } },
                steps.map((label, index) =>
                    React.createElement(
                        Step,
                        { key: label.toString() },
                        React.createElement(
                            StepLabel,
                            {
                                error: Object.values(
                                    errors[index] || {}
                                ).filter((e) => !!e).length,
                            },
                            label
                        )
                    )
                )
            ),

            React.createElement(getStepContent(activeStep), {
                form: formValues,
                errors: errors[activeStep],
                handleUpdateForm,
                reportError,
            }),

            React.createElement(
                Box,
                { sx: { display: 'flex', justifyContent: 'flex-end' } },
                [
                    activeStep !== 0
                        ? React.createElement(
                              Button,
                              { onClick: handleBack, sx: { mt: 3, ml: 1 } },
                              'Previous'
                          )
                        : null,

                    activeStep < steps.length - 1
                        ? React.createElement(
                              Button,
                              {
                                  variant: 'contained',
                                  onClick: handleNext,
                                  sx: { mt: 3, ml: 1 },
                                  disabled: Object.values(
                                      errors[activeStep] || {}
                                  ).filter((e) => !!e).length,
                              },
                              'Next'
                          )
                        : null,

                    activeStep === steps.length - 1
                        ? React.createElement(
                              Button,
                              {
                                  variant: 'contained',
                                  type: 'submit',
                                  sx: { mt: 3, ml: 1 },
                                  disabled: Object.values(
                                      errors[activeStep] || {}
                                  ).filter((e) => !!e).length,
                              },
                              'Submit'
                          )
                        : null,
                ]
            ),
        ]
    )
}

////// Step1
function IdentityForm({ form, handleUpdateForm, errors = {} }) {
    const { Box, Typography, Grid, TextField } = MaterialUI

    const onChange = (e) => {
        if (e.target.name === 'name')
            return handleUpdateForm('name', e.target.value, e)
        if (e.target.name === 'email')
            return handleUpdateForm('email', e.target.value, e)
    }

    return React.createElement(Box, {}, [
        React.createElement(
            Typography,
            { variant: 'h6', gutterBottom: true },
            'Identity'
        ),

        React.createElement(Grid, { container: true, spacing: 3 }, [
            React.createElement(
                Grid,
                { item: true, xs: 12, sm: 12 },
                React.createElement(TextField, {
                    required: false,
                    id: 'name',
                    name: 'name',
                    label: 'Name',
                    fullWidth: true,
                    autoComplete: 'given-name',
                    variant: 'standard',
                    value: form.name,
                    error: errors['name'],
                    helperText: errors['name'],
                    onChange,
                })
            ),
            React.createElement(
                Grid,
                { item: true, xs: 12, sm: 12 },
                React.createElement(TextField, {
                    required: false,
                    id: 'email',
                    name: 'email',
                    label: 'E-mail',
                    fullWidth: true,
                    autoComplete: 'email',
                    variant: 'standard',
                    value: form.email,
                    error: errors['email'],
                    helperText: errors['email'],
                    onChange,
                })
            ),
        ]),
    ])
}

////// Step2
const genderOptions = [
    'woman',
    'man',
    'transgender',
    'non-binary/non-conforming',
    'prefer not to respond',
]

function DetailsForm({ form, handleUpdateForm, errors = {}, reportError }) {
    const {
        Box,
        Typography,
        Grid,
        Select,
        FormLabel,
        FormControl,
        FormControlLabel,
        InputLabel,
        RadioGroup,
        Radio,
        MenuItem,
        FormHelperText,
    } = MaterialUI

    const onChange = (e) => {
        const fieldName = e.target.name
        const value = e.target.value

        if (fieldName === 'age') {
            if (!value) reportError(fieldName, ERRORS.required)
            else reportError(fieldName, null)

            return handleUpdateForm(fieldName, value)
        }

        if (fieldName === 'gender') {
            if (!value) reportError(fieldName, ERRORS.required)
            else reportError(fieldName, null)

            return handleUpdateForm(fieldName, value.toLowerCase())
        }
    }

    return React.createElement(Box, {}, [
        React.createElement(
            Typography,
            { variant: 'h6', gutterBottom: true },
            'Details'
        ),

        React.createElement(Grid, { container: true, spacing: 3 }, [
            React.createElement(
                Grid,
                { item: true, xs: 12, sm: 12 },

                React.createElement(
                    FormControl,
                    { fullWidth: true, required: true, error: errors['age'] },
                    [
                        React.createElement(
                            InputLabel,
                            { variant: 'standard' },
                            'Age'
                        ),

                        React.createElement(
                            Select,
                            {
                                name: 'age',
                                label: 'Age',
                                fullWidth: true,
                                variant: 'standard',
                                value: form.age,
                                onChange,
                            },
                            new Array(100)
                                .fill(null)
                                .map((_, index) =>
                                    React.createElement(
                                        MenuItem,
                                        { value: index + 1 },
                                        index + 1
                                    )
                                )
                        ),

                        errors['age'] &&
                            React.createElement(
                                FormHelperText,
                                {},
                                errors['age']
                            ),
                    ]
                )
            ),

            React.createElement(Grid, { item: true, xs: 12, sm: 12 }, [
                React.createElement(
                    FormControl,
                    {
                        fullWidth: true,
                        required: true,
                        error: errors['gender'],
                    },
                    [
                        React.createElement(
                            FormLabel,
                            { id: 'gender-group-label' },
                            'Gender'
                        ),

                        genderOptions.map((gender) =>
                            React.createElement(
                                RadioGroup,
                                { item: true, xs: 3, sm: 3 },
                                React.createElement(FormControlLabel, {
                                    id: `gender-${gender}`,
                                    name: 'gender',
                                    label: gender,
                                    value: gender,
                                    control: React.createElement(Radio, {}),
                                    checked:
                                        form.gender.toLowerCase() ===
                                        gender.toLowerCase(),
                                    onChange,
                                    sx: {
                                        textTransform: 'capitalize',
                                    },
                                })
                            )
                        ),

                        errors['gender'] &&
                            React.createElement(
                                FormHelperText,
                                {},
                                errors['gender']
                            ),
                    ]
                ),
            ]),
        ]),
    ])
}

////// Step3
const colorOptions = [
    'black',
    'silver',
    'gray',
    'white',
    'maroon',
    'red',
    'purple',
    'pink',
    'green',
    'lime',
    'olive',
    'yellow',
    'navy',
    'blue',
    'teal',
    'aqua',
]

function FavoritesForm({ form, handleUpdateForm, errors = {}, reportError }) {
    const {
        Box,
        Typography,
        Grid,
        TextField,
        FormControl,
        InputLabel,
        Select,
        MenuItem,
        Checkbox,
        ListItemText,
        FormHelperText,
    } = MaterialUI

    const onChange = (e) => {
        const fieldName = e.target.name
        const value = e.target.value

        if (fieldName === 'favoriteBook') {
            if (!value) reportError('favoriteBook', ERRORS.required)
            else reportError('favoriteBook', null)

            return handleUpdateForm('favoriteBook', value, e)
        }

        if (fieldName === 'favoriteColors') {
            if (!value.length) reportError(fieldName, ERRORS.required)
            else reportError(fieldName, null)

            return handleUpdateForm(
                fieldName,
                typeof value === 'string'
                    ? value.split(',')
                    : [...new Set(value)],
                e
            )
        }
    }

    return React.createElement(Box, {}, [
        React.createElement(
            Typography,
            { variant: 'h6', gutterBottom: true },
            'Favorites'
        ),

        React.createElement(Grid, { container: true, spacing: 3 }, [
            React.createElement(
                Grid,
                { item: true, xs: 12, sm: 12 },
                React.createElement(TextField, {
                    required: true,
                    id: 'favorite-book',
                    name: 'favoriteBook',
                    label: 'Favorite Book',
                    fullWidth: true,
                    variant: 'standard',
                    value: form.favoriteBook,
                    error: errors['favoriteBook'],
                    helperText: errors['favoriteBook'],
                    onChange,
                })
            ),

            React.createElement(
                Grid,
                { item: true, xs: 12, sm: 12 },

                React.createElement(
                    FormControl,
                    {
                        fullWidth: true,
                        required: true,
                        error: errors['favoriteColors'],
                    },
                    [
                        React.createElement(
                            InputLabel,
                            { variant: 'standard' },
                            'Favorite colors'
                        ),

                        React.createElement(
                            Select,
                            {
                                label: 'Favorite colors',
                                name: 'favoriteColors',
                                fullWidth: true,
                                multiple: true,
                                value: [...new Set(form.favoriteColors)],
                                onChange,
                                variant: 'standard',
                                renderValue: (selected) => selected.join(', '),
                            },
                            colorOptions.map((color) =>
                                React.createElement(
                                    MenuItem,
                                    { key: color, value: color },
                                    [
                                        React.createElement(Checkbox, {
                                            checked:
                                                form.favoriteColors.includes(
                                                    color
                                                ),
                                            sx: {
                                                color,
                                                '&.Mui-checked': { color },
                                            },
                                        }),
                                        React.createElement(ListItemText, {
                                            primary: color,
                                        }),
                                    ]
                                )
                            )
                        ),

                        errors['favoriteColors'] &&
                            React.createElement(
                                FormHelperText,
                                {},
                                errors['favoriteColors']
                            ),
                    ]
                )
            ),
        ]),
    ])
}

////// Step4
const maplabelsAndFieldsForm = [
    {
        category: 'Identity',
        fields: [
            {
                field: 'name',
                label: 'Name',
                renderBy: (value = '') => value.trim() || 'anonymous',
                sx: {
                    textTransform: 'capitalize',
                },
            },
            {
                field: 'email',
                label: 'Email',
                renderBy: (value = '') => value.trim() || 'anonymous',
            },
        ],
    },
    {
        category: 'Details',
        fields: [
            {
                field: 'age',
                label: 'Age',
            },
            {
                field: 'gender',
                label: 'Gender',
                sx: {
                    textTransform: 'capitalize',
                },
            },
        ],
    },
    {
        category: 'Favorites',
        fields: [
            {
                field: 'favoriteBook',
                label: 'Favotire Book',
            },
            {
                field: 'favoriteColors',
                label: 'Favotire Colors',
                renderBy: (value) => value.join(', '),
                sx: {
                    textTransform: 'capitalize',
                },
            },
        ],
    },
]

function Summary({ form }) {
    const { Box, Grid, Typography, Divider } = MaterialUI

    return React.createElement(Box, {}, [
        React.createElement(
            Typography,
            { variant: 'h6', gutterBottom: true },
            'Summary'
        ),

        React.createElement(Grid, { container: true, spacing: 2 }, [
            React.createElement(Grid, { item: true, xs: 12, sm: 12 }, [
                maplabelsAndFieldsForm.map(({ category, fields }, index) =>
                    React.createElement(React.Fragment, {}, [
                        index > 0 &&
                            React.createElement(Divider, { sx: { mt: 2 } }),

                        React.createElement(
                            Typography,
                            {
                                variant: 'h5',
                                gutterBottom: true,
                                sx: { mt: 2 },
                            },
                            category
                        ),

                        React.createElement(
                            Grid,
                            { container: true },
                            fields.map(({ label, field, renderBy, sx = {} }) =>
                                React.createElement(React.Fragment, {}, [
                                    React.createElement(
                                        Grid,
                                        { item: true, xs: 6 },
                                        React.createElement(
                                            Typography,
                                            { gutterBottom: true },
                                            label
                                        )
                                    ),

                                    ((form && field && form[field]) ||
                                        renderBy) &&
                                        React.createElement(
                                            Grid,
                                            { item: true, xs: 6 },
                                            React.createElement(
                                                Typography,
                                                {
                                                    gutterBottom: true,
                                                    sx: {
                                                        wordWrap: 'break-word',
                                                        ...sx,
                                                    },
                                                },
                                                renderBy
                                                    ? renderBy(form[field])
                                                    : form[field]
                                            )
                                        ),
                                ])
                            )
                        ),
                    ])
                ),
            ]),
        ]),
    ])
}

// SETUP
function setup(rate = 0) {
    try {
        if (window.React && window.ReactDOM && window.MaterialUI) {
            inject({ tag: 'div', scope: 'body', id: 'survey' })
        }

        ReactDOM.render(
            React.createElement(Main),
            document.querySelector('#survey')
        )
    } catch (err) {
        if (
            rate < 5 &&
            [window.React, window.ReactDOM, window.MaterialUI].some((r) => !r)
        ) {
            setTimeout(() => setup(rate + 1), 500)
        }
    }
}

// INIT
const dependencies = {
    react: 'https://unpkg.com/react@17/umd/react.production.min.js',
    reactDom: 'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
    font: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap',
    materialUI:
        'https://unpkg.com/@mui/material@latest/umd/material-ui.production.min.js',
}

;(async () => {
    // It goes block injection libraries and script if user already submitted
    if (cacheService.load().status === 'submitted') return

    inject({
        tag: 'script',
        scope: 'head',
        src: dependencies.react,
        crossorigin: true,
    })

    inject({
        tag: 'script',
        scope: 'head',
        src: dependencies.reactDom,
        crossorigin: true,
    })

    inject({
        tag: 'link',
        scope: 'head',
        rel: 'stylesheet',
        href: dependencies.font,
    })

    inject({ tag: 'script', scope: 'head', src: dependencies.materialUI })

    setTimeout(setup, 2000) // 2 seconds
})()
