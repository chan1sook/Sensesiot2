import Blockly from 'blockly'
import { dateGroupcolor, logicGroupcolor, sensorGroupcolor } from './colors'

import { truncate } from '~/utils/utils'

// ------------ Base Event ------------
Blockly.Blocks.condition_event = {
  init() {
    this.jsonInit({
      type: 'condition_event',
      args0: [
        {
          type: 'input_dummy',
        },
        {
          type: 'input_statement',
          name: 'CONDITION',
        },
      ],
      inputsInline: false,
      message0: 'Every tick (1 min) %1 %2',
      colour: 90,
      tooltip: 'Condition Event',
      helpUrl: '',
    })
    this.setDeletable(false)
    // this.setMovable(true)
    // this.setEditable(true)
  },
}

// ------------ Sensor Groups ------------
Blockly.Blocks.read_sensor_data = {
  init() {
    this.jsonInit({
      type: 'read_sensor_data',
      args0: [
        {
          type: 'input_dummy',
        },
        {
          type: 'input_dummy',
          name: 'DEVICE_DROPDOWN',
        },
        {
          type: 'field_number',
          name: 'SLOT',
          min: 1,
        },
      ],
      inputsInline: false,
      output: 'Number',
      message0: 'Read Sensor Data %1 Device Key %2 Slot %3',
      colour: sensorGroupcolor,
      tooltip: 'Read Sensor Data',
      helpUrl: '',
      extensions: ['dynamic_device_extension'],
    })
  },
}

Blockly.Blocks.read_sensor_control_state = {
  init() {
    this.jsonInit({
      type: 'read_sensor_control_state',
      args0: [
        {
          type: 'input_dummy',
        },
        {
          type: 'input_dummy',
          name: 'DEVICE_DROPDOWN',
        },
        {
          type: 'field_number',
          name: 'SLOT',
          min: 1,
        },
      ],
      inputsInline: false,
      output: 'String',
      message0: 'Read Control Sensor State %1 Device Key %2 Slot %3',
      colour: sensorGroupcolor,
      tooltip: 'Read Control Sensor State',
      helpUrl: '',
      extensions: ['dynamic_device_extension'],
    })
  },
}

Blockly.Blocks.control_sensor_push = {
  init() {
    this.jsonInit({
      type: 'control_sensor_push',
      args0: [
        {
          type: 'input_dummy',
        },
        {
          type: 'input_dummy',
          name: 'DEVICE_DROPDOWN',
        },
        {
          type: 'field_number',
          name: 'SLOT',
          min: 1,
        },
        {
          type: 'input_dummy',
        },
      ],
      inputsInline: false,
      previousStatement: null,
      nextStatement: null,
      message0: 'Control Sensor %1 Device Key %2 Slot %3 %4 Push',
      colour: sensorGroupcolor,
      tooltip: 'Control Sensor Push',
      helpUrl: '',
      extensions: ['dynamic_device_extension'],
    })
  },
}

Blockly.Blocks.control_sensor_toggle = {
  init() {
    this.jsonInit({
      type: 'control_sensor_toggle',
      args0: [
        {
          type: 'input_dummy',
        },
        {
          type: 'input_dummy',
          name: 'DEVICE_DROPDOWN',
        },
        {
          type: 'field_number',
          name: 'SLOT',
          min: 1,
        },
        {
          type: 'input_dummy',
        },
        {
          type: 'field_dropdown',
          name: 'VALUE',
          options: [
            ['On', 'ON'],
            ['Off', 'OFF'],
            ['Toogle', 'TOGGLE'],
          ],
        },
      ],
      inputsInline: false,
      previousStatement: null,
      nextStatement: null,
      message0: 'Control Sensor %1 Device Key %2 Slot %3 %4 Switch To %5',
      colour: sensorGroupcolor,
      tooltip: 'Control Sensor Toggle Switch',
      helpUrl: '',
      extensions: ['dynamic_device_extension'],
    })
  },
}

Blockly.Blocks.control_sensor_range = {
  init() {
    this.jsonInit({
      type: 'control_sensor_range',
      args0: [
        {
          type: 'input_dummy',
        },
        {
          type: 'input_dummy',
          name: 'DEVICE_DROPDOWN',
        },
        {
          type: 'field_number',
          name: 'SLOT',
          min: 1,
        },
        {
          type: 'input_dummy',
        },
        {
          type: 'input_value',
          name: 'VALUE',
          check: 'Number',
        },
      ],
      inputsInline: false,
      previousStatement: null,
      nextStatement: null,
      message0: 'Control Sensor %1 Device Key %2 Slot %3 %4 Volume Slide To %5',
      colour: sensorGroupcolor,
      tooltip: 'Control Sensor Volume',
      helpUrl: '',
      extensions: ['dynamic_device_extension'],
    })
  },
}

// ------------ DateTime Groups ------------
Blockly.Blocks.current_datetime = {
  init() {
    this.jsonInit({
      type: 'current_datetime',
      message0: 'Current Datetime',
      output: 'Date',
      colour: dateGroupcolor,
      tooltip: 'Current Datetime',
      helpUrl: '',
    })
  },
}

Blockly.Blocks.datetime_of = {
  init() {
    this.jsonInit({
      type: 'datetime_of',
      message0: 'Datetime of %1 Day %2 %3 Hour %4 %5 Minite %6',
      args0: [
        {
          type: 'input_dummy',
        },
        {
          type: 'field_dropdown',
          name: 'DAY_OF_WEEK',
          options: [
            ['Sun', 'SUN'],
            ['Mon', 'MON'],
            ['Tue', 'TUE'],
            ['Wed', 'WED'],
            ['Thr', 'THR'],
            ['Fri', 'FRI'],
            ['Sat', 'SAT'],
          ],
        },
        {
          type: 'input_dummy',
        },
        {
          type: 'field_number',
          name: 'HOUR',
          min: 0,
          max: 23,
        },
        {
          type: 'input_dummy',
        },
        {
          type: 'field_number',
          name: 'MINUTE',
          min: 0,
          max: 59,
        },
      ],
      output: 'Date',
      colour: dateGroupcolor,
      tooltip: 'Datetime of',
      helpUrl: '',
    })
  },
}

Blockly.Blocks.datetime_equals = {
  init() {
    this.jsonInit({
      type: 'datetime_equals',
      message0: '%1 %2 %3',
      args0: [
        {
          type: 'input_value',
          name: 'A',
          check: 'Date',
        },
        {
          type: 'field_dropdown',
          name: 'OPS',
          options: [
            ['Equal Datetime', 'EQUAL_DATETIME'],
            ['Equal Time', 'EQUAL_TIMES'],
          ],
        },
        {
          type: 'input_value',
          name: 'B',
          check: 'Date',
        },
      ],
      output: 'Boolean',
      colour: logicGroupcolor,
      tooltip: 'Datetime equals compare',
      helpUrl: '',
    })
  },
}

Blockly.Blocks.line_notify = {
  init() {
    this.jsonInit({
      type: 'line_notify',
      args0: [
        {
          type: 'input_dummy',
        },
        {
          type: 'field_input',
          name: 'LINE_TOKEN',
          text: '',
        },
        {
          type: 'input_dummy',
        },
        {
          type: 'input_value',
          name: 'MESSAGE',
          check: 'String',
        },
      ],
      inputsInline: false,
      previousStatement: null,
      nextStatement: null,
      message0: 'Alarm to LINE Notify %1 Token %2 %3 Message %4',
      colour: 180,
      tooltip: 'Alarm to LINE NOTIFY',
      helpUrl: '',
    })
    // TODO generate dynamic device name
  },
}

Blockly.Blocks.widget_notify = {
  init() {
    this.jsonInit({
      type: 'widget_notify',
      args0: [
        {
          type: 'input_dummy',
        },
        {
          type: 'input_value',
          name: 'MESSAGE',
          check: 'String',
        },
        {
          type: 'input_dummy',
        },
        {
          type: 'field_checkbox',
          name: 'IS_ERROR',
        },
      ],
      inputsInline: false,
      previousStatement: null,
      nextStatement: null,
      message0: 'Notify to Widget %1 Message %2 %3 Is Error %4',
      colour: 180,
      tooltip: 'Notify to Widget',
      helpUrl: '',
    })
    // TODO generate dynamic device name
  },
}

if (Blockly.Extensions.isRegistered('dynamic_device_extension')) {
  Blockly.Extensions.unregister('dynamic_device_extension')
}

Blockly.Extensions.register('dynamic_device_extension', function () {
  this.getInput('DEVICE_DROPDOWN').appendField(
    new Blockly.FieldDropdown(function () {
      if (!Array.isArray(Blockly._sensesiotDevices)) {
        return []
      }

      return Blockly._sensesiotDevices.map((ele) => {
        const deviceKey = truncate(ele.deviceKey)
        const deviceName = ele.name ? `${ele.name} (${deviceKey})` : deviceKey
        return [deviceName, ele.deviceKey]
      })
    }),
    'DEVICE_KEY'
  )
})
