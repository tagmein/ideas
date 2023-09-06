import { main } from './app/main'
import { battery_tools } from './ideas/Battery'
import { box_tools } from './ideas/Box'
import { Doc } from './ideas/Document'
import { idea_tools } from './ideas/Idea'
import { Library, library_tools } from './ideas/Library'

let TOTAL_POWER = 0x1000

function battery() {
 const [new_battery, remaining_charge] =
  battery_tools.create_battery(TOTAL_POWER)
 TOTAL_POWER = remaining_charge
 return new_battery
}

const library = idea_tools.create(Library)
const home = idea_tools.create(Doc)
home.battery = battery()
home.labels = new Set([{ title: 'Home' }])
library_tools.prepare_html_element(home)
const home_element = box_tools.to_html_element<HTMLDivElement>(home)
document.body.appendChild(home_element)

async function start() {
 const app = await main(library, home, home_element)
 function route() {
  const id = location.hash.substring(2)
  app.route(id)
 }
 addEventListener('hashchange', route)
 route()
}
start().catch((e) => console.error(e))
