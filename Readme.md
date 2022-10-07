A simple minesweeper by pure js.

Visiting the game online 
http://81.68.153.205/

Function:
The core of select mines: shuffle an Array with total number of grids and select the and select the front specified number as mines.
Draw grids: set the left and top borders light shadow, the right and bottom borders deep shallow to get the 3d visual effect.
Open the grids: if have mines around, just open the current grid, else open the around grids by recursion.
Auto open grid in the normal and diffcult: Find a grid without mines and open it. It is promised that the grids have a position without mines around when creating. 
The opned grids will have a img to overlap. They are added or removed by the dynamic class styles.
Auto Flag: check the number of grids with out flag.
The help of auto open grid: just find the first grid without mine and open it. It can be random.
The condition of win: all of the grids without flag are opened and all of the grids with mines are falged.

Weakness:
All logic and algorithms are written in the front end.
The static resources are deployed on the server by nginx.

How to overcome these shortcomings:
1. Use canvas instead 
2. Move the algorithms to the back end.

Plans:
1. Add ranklist for each difficulty.
2. Multi player online competition (broadcasting information by websocket).

Preview:
![S~2AF$@E3IBLP9UELLS9`J5](https://user-images.githubusercontent.com/52645159/194590335-ed3428ca-5c4b-4455-889d-1e5e80576588.png)
