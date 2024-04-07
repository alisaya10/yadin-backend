const useful = require('./useful')
const thingsModel = require('../models/thingsModel');

exports.checkConditionGroup = (group, variables, helper, cb) => {
    // console.log("checkConditionGroup")
    let result = false
    let conflict = false
    if (group.action && group.action == 'and') {
        result = true
    }


    let promises = []
        // console.log('group.conditions')
        // console.log(group.conditions)
    for (const [key, value] of Object.entries(group.conditions)) {
        promises.push(new Promise((resolve, reject) => {
            // if (this.checkOneCondition(value, variables) != result) {
            //     return !result
            // }
            this.checkOneCondition(value, variables, helper, (condRes) => {


                if (result != condRes) {
                    conflict = true
                }
                resolve()
            })
        }))
    }

    Promise.all(promises).then(() => {

            if (conflict) {
                result = !result
            }
            cb(result)
        })
        // return result
}




exports.checkOneCondition = (condition, variables, helper, cb) => {
    // console.log("checkOneCondition")

    let action = condition.action
    if (action) {
        this.checkConditionGroup(condition, variables, helper, (checkRes) => {
            cb(checkRes)
        })
    } else {
        // console.log(condition)
        // source operator target
        this.checkValueForVariables(condition.source, variables, helper, (ress1) => {
            console.log("ress1")
            console.log(ress1)

            let source = ress1
            let operator = condition.operator
            this.checkValueForVariables(condition.target, variables, helper, (ress2) => {
                console.log("ress2")
                console.log(ress2)


                let target = ress2
                    // console.log("checkOperator")
                    // console.log(this.checkOperator(source, operator, target))
                cb(this.checkOperator(source, operator, target))
            })

        })


    }
}


exports.checkOperator = (vt1, operator, vt2) => {
    console.log("### checkOperator")
        // console.log(String(vt1))


    // console.log(String("35") == String(35))
    let v1 = String(vt1)
    let v2 = String(vt2)

    if (v1 && (v1[v1.length - 1] == ' ' || v1[v1.length - 1] == ' ')) {
        v1 = v1.substring(0, v1.length - 1)
    }

    if (v2 && (v2[v2.length - 1] == ' ' || v2[v2.length - 1] == ' ')) {
        v2 = v2.substring(0, v2.length - 1)
    }


    console.log("v1")
    console.log(String(v1))
    console.log(String(v1).length)

    console.log("operator")
    console.log(operator)
    console.log("v2")
    console.log(String(v2))
    console.log(String(v2).length)
    console.log(String(v1) == String(v2))


    switch (operator) {
        case '=':
            return (String(v1) == String(v2))
        case '==':
            return (String(v1) == String(v2))
        case '===':
            return (v1 === v2)
        case '!=':
            return (v1 != v2)
        case '!==':
            return (v1 !== v2)
        case '<':
            return (Number(v1) < Number(v2))
        case '<=':
            return (Number(v1) <= Number(v2))
        case '>':
            return (Number(v1) > Number(v2))
        case '>=':
            return (Number(v1) >= Number(v2))
        case '&&':
            return (v1 && v2)
        case '||':
            return (v1 || v2)
        default:
            return false
    }
}



exports.checkValueForVariables = (value, variables, helper, cb) => {


    // console.log("checkValueForVariables")

    let newValue = value.replace(/ /g, " ")
    let promises = []

    if (typeof newValue == "string") {
        newValue = newValue.split(' ')

        for (let i = 0; i < newValue.length; i++) {
            const element = newValue[i]

            console.log("element")
            console.log(element)
            if (element.startsWith('@')) {
                // console.log(this.getValueOfVariable(element, variables))
                let normalizedVariable = this.normalizeVariable(element, helper)

                // console.log("normalizedVariable")
                // console.log(normalizedVariable)

                this.getValueOfVariable(normalizedVariable, variables, (dress) => {
                    newValue[i] = dress

                    // console.log("newValue[i]")
                    // console.log(newValue[i])


                    if (!newValue[i]) {
                        promises.push(new Promise((resolve, reject) => {
                            // console.log("PROMISE ADDED")
                            this.createVariableValue(normalizedVariable, variables, helper, () => {
                                // console.log("normalizedVariable")
                                // console.log(normalizedVariable)
                                // console.log("OK?")
                                // console.log(this.getValueOfVariable(normalizedVariable, variables))
                                this.getValueOfVariable(normalizedVariable, variables, (vress) => {
                                    if (!Array.isArray(newValue)) {
                                        newValue = []
                                    }
                                    newValue[i] = vress
                                        // console.log("newValue[i]")
                                        // console.log(vress)
                                        // console.log(newValue)
                                        // console.log(newValue[i])
                                        // console.log(i)

                                    resolve()
                                })

                            })
                        }))

                    }
                })
            }
        }
        if (newValue.length > 1) {
            newValue = newValue.join(' ')
        } else {
            newValue = newValue[0]
        }
    }

    Promise.all(promises).then(() => {

        cb(newValue)

    }).catch((err) => {
        cb(null, true)
    })

}

exports.normalizeVariable = (element, helper) => {
    let final = element.replace('@', '')
    let sections = final.split('.')
    let section = sections[0]

    if (section == 'inputs') {
        // console.log(sections[1])
        let inputName = sections[1]
        let pathKey = ''
        if (helper && helper.cpaths) {
            for (const [key, value] of Object.entries(helper.cpaths)) {
                if (value.node == inputName) {
                    pathKey = key
                }
            }
        }
        final = '@' + '**inputs.' + pathKey
    }

    if (section == 'things') {

        let id = element.match(/\(([^\)]+)\)/)
        if (id[1]) {
            id = id[1]
        }
        final = '@' + 'things.' + id + '.' + sections[2].replace("(" + id + ")", '')

        // console.log(sections[1])
        // console.log(sections)
    }
    // console.log("final")
    // console.log(final)

    return final
}


exports.createVariableValue = (element, variables, helper, cb) => {
    let sections = element.replace('@', '').split('.')
    let section = sections[0]
    console.log("createVariableValue")
    console.log(sections)

    if (section == '**inputs') {
        if (helper.paths) {
            if (!variables['**inputs']) {
                variables['**inputs'] = {}
            }
            let pathKey = sections[1]

            variables['**inputs'][sections[1]] = helper.paths[pathKey] ? helper.paths[pathKey].value : ''
        }
        cb()
            // variables['inputs'][]
    }

    if (section == 'things') {
        let thingKey = sections[1]
        console.log("thingKey")
        console.log(thingKey)
    }

}



exports.getValueOfVariable = (element, variables, cb) => {
    // console.log(element)
    let key = element.substring(1)
    key = key.split('.')
    let variableSource = key[0]
    key.splice(0, 1)
    key = key.join('.')

    // console.log(variableSource)
    // console.log("variableSource")
    // console.log(key)
    // console.log(variables[variableSource])

    let result = useful.getObject(variables[variableSource], key)

    // console.log("FILNAL")
    // console.log(result)
    cb(result)
        // return result
}





exports.getThingById = (id, cb) => {

    if (id) {
        thingsModel.findOne({ _id: id, trashed: { $ne: true }, removed: { $ne: true } }).lean().then((thing) => {
            // console.log("THING GOUND")
            if (thing) {
                cb(thing)
            } else {
                cb(null, true)
            }
        }).catch((err) => {
            cb(null, true)

        })
    } else {

        cb(null, true)
    }

}