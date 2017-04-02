# snake
limited demo at : https://codepen.io/Xxusen/details/BWMrKo/

The old fashioned game, surface touch and keyboard controlled. 

HOW TO EMBED THIS GAME INTO A WEBPAGE OF YOURS:

Place this chunk of code in between your page's head tags:
```javascript
  <script>
    window.addEventListener("load", function() {
      var arena = new Arena(PARENT, WIDTH, HEIGHT, BLOCK_SIDE_LENGTH);
    });
  </script>
```

Replacing:

  * PARENT by the element in which you want the game to be embedded in (a div element would be perfect)
  * WIDTH & HEIGHT by the dimensions (in pixels) of the game (e.g : 700, 350)
  * BLOCK_SIDE_LENGTH by the length of the blocks' side in the game (in pixels)


Be careful of paths, make sure your page loads all the files, use snake.htm as an example.
