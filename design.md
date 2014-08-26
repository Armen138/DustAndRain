js13kgames
==========

* 13kb javascript

minimal html
minimal sprite engine

procedural world
================

world includes grassland, rock(mountain), water, and fire(lava)

gameplay
========

player starts with a settler unit in order to settle their first city.
The city will have different resources available to it depending on its location.

resources are:

* water
* earth
* fire
* air

A city gets more resource income depending on how close the corresponding tiles are.

Tiles give the following resources:

grass: earth
mountain: air
lava: fire
water: water

Cities can be built on grass and mountain.
Each tile gives 1 of its corresponding resource if within 1 tile from the city,
0.5 of the resource within 2 tiles of the city,
0.25 within 3 tiles.
The tile the city is built on gives 2.

Bonus income can be achieved by choosing certain upgrades.

Buildables
==========

*cost is indicated as ( water - earth - fire - air )*

* Settler - equal parts of all resources ( 1 - 3 - 1 - 3 )
* scout - ( 1 - 0 - 1 - 0 )
* soldier - ( 1 - 2 - 2 - 1 )
* mounted soldier - ( 2 - 4 - 3 - 4 )


Tech
====

* Ignition - increase fire income
* Water filtration - increase water income
* Groundwater extraction - increase water income for cities built on earth tiles
* Horticulture - increase air income
* Stables - enable mounted units
* Smelting - enable combat units - requires ignition
* Trade - enable traderoutes between cities

