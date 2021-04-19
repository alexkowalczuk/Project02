/***********************************************************************************
  TITLE: Piggy Run

  by ALEX KOWALCZUK

  Uses the p5.2DAdventure.js class 

  This game is supposed to be friendly for users in any age. That is why there is not much blood.
  The goal in the game is to save piglet from 'dangerous' places and situations.
  Simply use arrows on your keyboard and mouse to navigate trough the game. 
  In the code I used some clickable objects, and draw functions. We can see preloaded functions and variables. 
  In the code we can see that I used some of NPC’s functions.

***********************************************************************************/

// adventure manager global  
var adventureManager;

// p5.play
var playerSprite;
var playerAnimation;

// Clickables: the manager class
var clickablesManager;    // the manager class
var clickables;           // an array of clickable objects

// indexes into the clickable array (constants)
const playGameIndex = 0;
const restartGameIndex = 1;

var screamSound = null;
var numLives = 5;

// Allocate Adventure Manager with states table and interaction tables
function preload() {
  clickablesManager = new ClickableManager('data/clickableLayout.csv');
  adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv', 'data/clickableLayout.csv');
  piggy_image = loadImage('assets/avatars/piggy 1.png'); 
  piggy_image_2 = loadImage('assets/avatars/piggy 2.png'); 

  atariFont = loadFont('fonts/AtariClassic-Chunky.ttf');
}

// Setup the adventure manager
function setup() {
  createCanvas(1280, 720);

  // setup the clickables = this will allocate the array
  clickables = clickablesManager.setup();

  // create a sprite and add the 3 animations
  playerSprite = createSprite(158, 122, 80, 80);

  // every animation needs a descriptor, since we aren't switching animations, this string value doesn't matter
  piggy_image.resize(158,122); 
  piggy_image_2.resize(158,122); 
  playerSprite.addAnimation('right', piggy_image, piggy_image);
  playerSprite.addAnimation('left', piggy_image_2, piggy_image_2);
  

  // use this to track movement from toom to room in adventureManager.draw()
  adventureManager.setPlayerSprite(playerSprite);

  // this is optional but will manage turning visibility of buttons on/off
  // based on the state name in the clickableLayout
  adventureManager.setClickableManager(clickablesManager);

    // This will load the images, go through state and interation tables, etc
  adventureManager.setup();

  adventureManager.setChangedStateCallback(changedState);

  // call OUR function to setup additional information about the p5.clickables
  // that are not in the array 
  setupClickables(); 
}

// Adventure manager handles it all!
function draw() {
  // draws background rooms and handles movement from one to another
  adventureManager.draw();

  // draw the p5.clickables, in front of the mazes but behind the sprites 
  clickablesManager.draw();

  // No avatar for Splash screen or Instructions screen
  if( adventureManager.getStateName() !== "Start" && 
      adventureManager.getStateName() !== "Instruction" ) {
      
    // responds to keydowns
    moveSprite();

    fill(255, 0, 0);
    textFont(atariFont);
    textSize(20)
    textAlign(LEFT);
    text( "Lives: " + numLives, width-350, 50);

    // this is a function of p5.js, not of this sketch
    drawSprite(playerSprite);
  } 
}

// pass to adventure manager, this do the draw / undraw events
function keyPressed() {
  // toggle fullscreen mode
  if( key === 'f') {
    fs = fullscreen();
    fullscreen(!fs);
    return;
  }

  // dispatch key events for adventure manager to move from state to 
  // state or do special actions - this can be disabled for NPC conversations
  // or text entry   

  // dispatch to elsewhere
  adventureManager.keyPressed(key); 
}

function mouseReleased() {
  adventureManager.mouseReleased();
}

//-------------- CALLBACK FUNCTION FOR WHEN STATE HAS CHANGED -------//
function changedState(currentStateStr, newStateStr) {
  print("changed state" + "current state = " + currentStateStr + " new state = " + newStateStr);

}

//-------------- YOUR SPRITE MOVEMENT CODE HERE  ---------------//
function moveSprite() {
  if(keyIsDown(RIGHT_ARROW)) {
    playerSprite.velocity.x = 10;
    playerSprite.changeAnimation('right');
  }
  else if(keyIsDown(LEFT_ARROW)){
    playerSprite.changeAnimation('left'); 
    playerSprite.velocity.x = -10;
  }
  else
    playerSprite.velocity.x = 0;

  if(keyIsDown(DOWN_ARROW))
    playerSprite.velocity.y = 10;
  else if(keyIsDown(UP_ARROW))
    playerSprite.velocity.y = -10;
  else
    playerSprite.velocity.y = 0;
}

//-------------- CLICKABLE CODE  ---------------//

function setupClickables() {
  // All clickables to have same effects
  for( let i = 0; i < clickables.length; i++ ) {
    clickables[i].onHover = clickableButtonHover;
    clickables[i].onOutside = clickableButtonOnOutside;
    clickables[i].onPress = clickableButtonPressed;
  }
}

// tint when mouse is over
clickableButtonHover = function () {
  this.color = "#AA33AA";
  this.noTint = false;
  this.tint = "#FF0000";
}

// color a light gray if off
clickableButtonOnOutside = function () {
  // backto our gray color
  this.color = "#FF0000";
}

clickableButtonPressed = function() {
  // these clickables are ones that change your state
  // so they route to the adventure manager to do this
  adventureManager.clickablePressed(this.name); 

    // restart game with max lives
  if( this.name === "Restart" ) {
    numLives = 5;
  }

}

function die() {
  //screamSound.play();
  numLives--;
  if( numLives > 0 )  {
    adventureManager.changeState("Farm");
  }
  else {
    adventureManager.changeState("Dead");
  }
}


//-------------- SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//

// Instructions screen has a backgrounnd image, loaded from the adventureStates table
// It is sublcassed from PNGRoom, which means all the loading, unloading and drawing of that
// class can be used. We call super() to call the super class's function as needed
class InstructionsScreen extends PNGRoom {
  // preload is where we define OUR variables
  // Best not to use constructor() functions for sublcasses of PNGRoom
  // AdventureManager calls preload() one time, during startup
  preload() {
    // These are out variables in the InstructionsScreen class
    this.textBoxWidth = (width/6)*4;
    this.textBoxHeight = (height/6)*4; 

    // hard-coded, but this could be loaded from a file if we wanted to be more elegant
    this.instructionsText = "Just make sure piggy will survive....";
  }

  // call the PNGRoom superclass's draw function to draw the background image
  // and draw our instructions on top of this
  draw() {
    // tint down background image so text is more readable
    tint(128);
      
    // this calls PNGRoom.draw()
    super.draw();
      
    // text draw settings
    fill(255);
    textAlign(CENTER);
    textSize(30);

    // Draw text in a box
    text(this.instructionsText, width/6, height/6, this.textBoxWidth, this.textBoxHeight );
  }
}


class CityRoom extends PNGRoom {
  // preload() gets called once upon startup
  // We load ONE animation and create 20 NPCs
  preload() {
     // load the animation just one time
    this.NPCAnimation = loadAnimation('assets/NPCs/shoe1.png', 'assets/NPCs/shoe4.png');
    
    // this is a type from p5play, so we can do operations on all sprites
    // at once
    this.NPCgroup = new Group;

    // change this number for more or less
    this.numNPCs = 5;

    // is an array of sprites, note we keep this array because
    // later I will add movement to all of them
    this.NPCSprites = [];

    // this will place them randomly in the room
    for( let i = 0; i < this.numNPCs; i++ ) {
      // random x and random y poisiton for each sprite
      let randX  = random(100, width-100);
      let randY = random(100, height-100);

      // create the sprite
      this.NPCSprites[i] = createSprite( randX, randY, 40, 40);
    
      // add the animation to it (important to load the animation just one time)
      this.NPCSprites[i].addAnimation('regular', this.NPCAnimation );

      // add to the group
      this.NPCgroup.add(this.NPCSprites[i]);
    }
  }

  
  // pass draw function to superclass, then draw sprites, then check for overlap
  draw() {
    // PNG room draw
    super.draw();

    // draws all the sprites in the group
    this.NPCgroup.draw();

    // checks for overlap with ANY sprite in the group, if this happens
    // our die() function gets called
    playerSprite.overlap(this.NPCgroup, die);

    for( let i = 0; i < this.NPCSprites.length; i++ ) {
      this.NPCSprites[i].velocity.x = random(-1,1);
      this.NPCSprites[i].velocity.y = random(-1,1);
    }
  }
}

class OutsideRoom extends PNGRoom {
  // preload() gets called once upon startup
  // We load ONE animation and create 20 NPCs
  preload() {
     // load the animation just one time
    this.NPCAnimation = loadAnimation('assets/NPCs/wolf1.png', 'assets/NPCs/wolf4.png');
    
    // this is a type from p5play, so we can do operations on all sprites
    // at once
    this.NPCgroup = new Group;

    // change this number for more or less
    this.numNPCs = 4;

    // is an array of sprites, note we keep this array because
    // later I will add movement to all of them
    this.NPCSprites = [];

    // this will place them randomly in the room
    for( let i = 0; i < this.numNPCs; i++ ) {
      // random x and random y poisiton for each sprite
      let randX  = random(100, width-100);
      let randY = random(100, height-100);

      // create the sprite
      this.NPCSprites[i] = createSprite( randX, randY, 40, 40);
    
      // add the animation to it (important to load the animation just one time)
      this.NPCSprites[i].addAnimation('regular', this.NPCAnimation );

      // add to the group
      this.NPCgroup.add(this.NPCSprites[i]);
    }
  }

  
  // pass draw function to superclass, then draw sprites, then check for overlap
  draw() {
    // PNG room draw
    super.draw();

    // draws all the sprites in the group
    this.NPCgroup.draw();

    // checks for overlap with ANY sprite in the group, if this happens
    // our die() function gets called
    playerSprite.overlap(this.NPCgroup, die);

    for( let i = 0; i < this.NPCSprites.length; i++ ) {
      this.NPCSprites[i].velocity.x = random(-1,1);
      this.NPCSprites[i].velocity.y = random(-1,1);
    }
  }
}

class KitchenRoom extends PNGRoom {
  // preload() gets called once upon startup
  // We load ONE animation and create 20 NPCs
  preload() {
     // load the animation just one time
    this.NPCAnimation = loadAnimation('assets/NPCs/knife1.png', 'assets/NPCs/knife4.png');
    
    // this is a type from p5play, so we can do operations on all sprites
    // at once
    this.NPCgroup = new Group;

    // change this number for more or less
    this.numNPCs = 10;

    // is an array of sprites, note we keep this array because
    // later I will add movement to all of them
    this.NPCSprites = [];

    // this will place them randomly in the room
    for( let i = 0; i < this.numNPCs; i++ ) {
      // random x and random y poisiton for each sprite
      let randX  = random(100, width-100);
      let randY = random(100, height-100);

      // create the sprite
      this.NPCSprites[i] = createSprite( randX, randY, 40, 40);
    
      // add the animation to it (important to load the animation just one time)
      this.NPCSprites[i].addAnimation('regular', this.NPCAnimation );

      // add to the group
      this.NPCgroup.add(this.NPCSprites[i]);
    }
  }

  
  // pass draw function to superclass, then draw sprites, then check for overlap
  draw() {
    // PNG room draw
    super.draw();

    // draws all the sprites in the group
    this.NPCgroup.draw();

    // checks for overlap with ANY sprite in the group, if this happens
    // our die() function gets called
    playerSprite.overlap(this.NPCgroup, die);

    for( let i = 0; i < this.NPCSprites.length; i++ ) {
      this.NPCSprites[i].velocity.x = random(-1,1);
      this.NPCSprites[i].velocity.y = random(-1,1);
    }
  }
}

