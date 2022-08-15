import '~/blockly/toolbox'
import '~/blockly/blocks'
import { dateGroupcolor, sensorGroupcolor } from './colors'

const sensorCategory = {
  kind: 'category',
  name: 'Sensors',
  colour: sensorGroupcolor,
  contents: [
    {
      kind: 'block',
      type: 'read_sensor_data',
    },
    {
      kind: 'block',
      type: 'read_sensor_control_state',
    },
    {
      kind: 'sep',
    },
    {
      kind: 'block',
      type: 'control_sensor_push',
    },
    {
      kind: 'block',
      type: 'control_sensor_toggle',
    },
    {
      kind: 'block',
      type: 'control_sensor_range',
    },
  ],
}
const datetimeCategory = {
  kind: 'category',
  name: 'DateTime',
  colour: dateGroupcolor,
  contents: [
    {
      kind: 'block',
      type: 'current_datetime',
    },
    {
      kind: 'block',
      type: 'datetime_of',
    },
    {
      kind: 'sep',
    },
    {
      kind: 'block',
      type: 'datetime_equals',
      inputs: {
        A: {
          shadow: {
            type: 'current_datetime',
          },
        },
        B: {
          shadow: {
            type: 'datetime_of',
          },
        },
      },
    },
  ],
}
const logicCategory = {
  kind: 'category',
  name: 'Logic',
  categorystyle: 'logic_category',
  contents: [
    {
      kind: 'block',
      type: 'controls_if',
    },
    {
      kind: 'block',
      type: 'logic_boolean',
    },
    {
      kind: 'block',
      type: 'logic_negate',
      inputs: {
        BOOL: {
          shadow: {
            type: 'logic_boolean',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'logic_operation',
      inputs: {
        A: {
          shadow: {
            type: 'logic_boolean',
          },
        },
        B: {
          shadow: {
            type: 'logic_boolean',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'logic_compare',
      inputs: {
        A: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
        B: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
      },
    },
  ],
}
const mathCategory = {
  kind: 'category',
  name: 'Math',
  categorystyle: 'math_category',
  contents: [
    {
      kind: 'block',
      type: 'math_number',
      fields: {
        NUM: 1,
      },
    },
    {
      kind: 'block',
      type: 'math_arithmetic',
      fields: {
        OP: 'ADD',
      },
      inputs: {
        A: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
        B: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'math_single',
      inputs: {
        NUM: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'math_trig',
      inputs: {
        NUM: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 45,
            },
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'math_constant',
    },
    {
      kind: 'block',
      type: 'math_number_property',
      inputs: {
        NUMBER_TO_CHECK: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'math_round',
      inputs: {
        NUM: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'math_modulo',
      inputs: {
        DIVIDEND: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
        DIVISOR: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'math_constrain',
      inputs: {
        VALUE: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 50,
            },
          },
        },
        LOW: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
        HIGH: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 100,
            },
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'math_random_int',
      inputs: {
        FROM: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
        TO: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 50,
            },
          },
        },
      },
    },
  ],
}
const textCategory = {
  kind: 'category',
  name: 'Text',
  categorystyle: 'text_category',
  contents: [
    {
      kind: 'block',
      type: 'text',
    },
    {
      kind: 'block',
      type: 'text_multiline',
    },
    {
      kind: 'block',
      type: 'text_join',
    },
    {
      kind: 'block',
      type: 'text_append',
      inputs: {
        TEXT: {
          shadow: {
            type: 'text',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'text_length',
      inputs: {
        VALUE: {
          shadow: {
            type: 'text',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'text_isEmpty',
      inputs: {
        VALUE: {
          shadow: {
            type: 'text',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'text_indexOf',
      inputs: {
        VALUE: {
          shadow: {
            type: 'variables_get',
            fields: {
              VAR: 'text',
            },
          },
        },
        FIND: {
          shadow: {
            type: 'text',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'text_charAt',
      inputs: {
        VALUE: {
          shadow: {
            type: 'text',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'text_getSubstring',
      inputs: {
        STRING: {
          shadow: {
            type: 'variables_get',
            fields: {
              VAR: 'text',
            },
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'text_changeCase',
      inputs: {
        TEXT: {
          shadow: {
            type: 'text',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'text_trim',
      inputs: {
        TEXT: {
          shadow: {
            type: 'text',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'text_count',
      inputs: {
        SUB: {
          shadow: {
            type: 'text',
          },
        },
        TEXT: {
          shadow: {
            type: 'text',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'text_replace',
      inputs: {
        FROM: {
          shadow: {
            type: 'text',
          },
        },
        TO: {
          shadow: {
            type: 'text',
          },
        },
        TEXT: {
          shadow: {
            type: 'text',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'text_reverse',
      inputs: {
        TEXT: {
          shadow: {
            type: 'text',
          },
        },
      },
    },
  ],
}
const alarmCategory = {
  kind: 'category',
  name: 'Alarm',
  colour: 205,
  contents: [
    {
      kind: 'block',
      type: 'line_notify',
    },
    {
      kind: 'block',
      type: 'widget_notify',
    },
  ],
}

export const conditionOptions = {
  toolbox: {
    kind: 'categoryToolbox',
    contents: [
      sensorCategory,
      datetimeCategory,
      logicCategory,
      mathCategory,
      textCategory,
      alarmCategory,
      {
        kind: 'sep',
      },
      {
        kind: 'category',
        name: 'Variables',
        categorystyle: 'variable_category',
        custom: 'VARIABLE',
      },
      {
        kind: 'category',
        name: 'Functions',
        categorystyle: 'procedure_category',
        custom: 'PROCEDURE',
      },
    ],
  },
}

export function getDefaultConditionBlocks() {
  return {
    blocks: {
      languageVersion: 0,
      blocks: [{ type: 'condition_event', x: 20, y: 20 }],
    },
  }
}

export default Object.freeze({
  conditionOptions,
  getDefaultConditionBlocks,
})
