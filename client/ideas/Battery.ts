import { style_tools } from './CSSStyleDeclaration'
import { contrast_tools } from './Contrast'

export interface BatteryIdea {
 battery_level_maximum: 0x10
 battery_level_low: 0x1
 battery_level: number
}

export interface HasBatteryIdea {
 battery?: BatteryIdea
}

const DEFAULT_BATTERY_LEVEL_MAXIMUM: BatteryIdea['battery_level_maximum'] = 0x10
const DEFAULT_BATTERY_LEVEL_LOW: BatteryIdea['battery_level_low'] = 0x1

const BATTERY_CONTAINER_CLASS = 'battery_container'
const BATTERY_LEVELS_CLASS = 'battery_levels'
const BATTERY_LEVEL_CLASS = 'battery_level'
const BATTERY_SPACER_CLASS = 'battery_pad'

style_tools.attach_style(BATTERY_CONTAINER_CLASS, {
 position: 'absolute',
 top: '8px',
 left: '8px',
 right: '8px',
 display: 'flex',
 flexDirection: 'column',
 gap: '2px',
})

style_tools.attach_style(BATTERY_LEVELS_CLASS, {
 display: 'flex',
 flexDirection: 'row',
 gap: '2px',
 height: '4px',
})

style_tools.attach_style(BATTERY_LEVEL_CLASS, {
 backgroundColor: '#000000',
 border: '1px solid #404040840',
 borderRadius: '4px',
 display: 'flex',
 flexDirection: 'column',
 flexGrow: '1',
 flexShrink: '1',
})

style_tools.attach_style(BATTERY_SPACER_CLASS, {
 flexShrink: '0',
 width: '4px',
})

export const battery_tools = {
 /**
  * create_battery creates a battery with a given initial charge
  * @param initial_charge amount to charge the batter
  * @returns [Battery, left over charge amount (number)]
  */
 create_battery(initial_charge: number): [BatteryIdea, number] {
  if (initial_charge > DEFAULT_BATTERY_LEVEL_MAXIMUM) {
   return [
    {
     battery_level: DEFAULT_BATTERY_LEVEL_MAXIMUM,
     battery_level_low: DEFAULT_BATTERY_LEVEL_LOW,
     battery_level_maximum: DEFAULT_BATTERY_LEVEL_MAXIMUM,
    },
    initial_charge - DEFAULT_BATTERY_LEVEL_MAXIMUM,
   ]
  }
  return [
   {
    battery_level: initial_charge,
    battery_level_low: DEFAULT_BATTERY_LEVEL_LOW,
    battery_level_maximum: DEFAULT_BATTERY_LEVEL_MAXIMUM,
   },
   0,
  ]
 },
 to_html_element_visual(battery: BatteryIdea) {
  const battery_container = document.createElement('div')
  const battery_levels_list = [0, 1, 2, 3].map(function (level) {
   const battery_levels = document.createElement('div')
   battery_levels.classList.add(BATTERY_LEVELS_CLASS)
   battery_container.appendChild(battery_levels)
   return battery_levels
  })
  battery_container.classList.add(BATTERY_CONTAINER_CLASS)
  for (let i = 0; i < battery.battery_level_maximum; i++) {
   const charge_colors = contrast_tools.to_hex_colors(
    contrast_tools.create_contrast(i),
   )
   if (i > 0 && i % 4 === 0) {
    const spacer = document.createElement('div')
    battery_levels_list.map(function (levels) {
     levels.appendChild(spacer.cloneNode())
    })
   }
   const level = document.createElement('div')
   level.classList.add(BATTERY_LEVEL_CLASS)
   for (const j of [0, 1, 2, 3]) {
    const battery_levels = battery_levels_list[j]
    const this_level = level.cloneNode() as HTMLDivElement
    this_level.style.backgroundColor = charge_colors[j]
    battery_levels.appendChild(this_level)
   }
  }
  return battery_container
 },
}
