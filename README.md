# 🎮 NEON BREAKOUT - Advanced Edition

A modern, neon-styled breakout game built with HTML5 Canvas and JavaScript featuring progressive difficulty, special brick types, and stunning visual effects.

## ✨ Features

- **Progressive Difficulty**: Each level introduces unique challenges
- **Special Brick Types**: Moving, invisible, regenerating, and multi-hit bricks
- **Neon Visual Style**: Cyberpunk-inspired design with glowing effects
- **Responsive Design**: Works on desktop and mobile devices
- **Achievement System**: Track your progress and unlock achievements
- **Multiple Difficulty Modes**: Easy, Normal, Hard, and Insane

## 🎯 Level Progression

- **Levels 2-3**: Moving bricks that slide horizontally
- **Levels 4-5**: Multi-hit bricks requiring extra hits
- **Levels 6-7**: Invisible bricks that flicker and fade
- **Levels 8-9**: Regenerating bricks that heal over time
- **Levels 10+**: Paddle shrinks progressively
- **Every 3 levels**: Ball speed increases
- **Every 5 levels**: Extra balls spawn
- **Level 15+**: Moving obstacles appear

## 🎮 Controls

- **Arrow Keys** or **Mouse**: Move paddle
- **Spacebar**: Launch ball
- **P** or **Escape**: Pause/Resume game

## 🚀 Quick Start

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. Click "START GAME" and choose your difficulty
4. Use arrow keys or mouse to control the paddle
5. Press spacebar to launch the ball

## 📁 File Structure

```
/Breakout/
├── index.html          # Main game page
├── main.css           # Core styles and neon effects
├── animations.css     # Animation keyframes
├── brick-classes.js   # Brick and PowerUp classes
├── game-classes.js    # Ball and Paddle classes
├── game-core.js       # Main game logic
└── README.md          # This file
```

## 🎨 Customization

The game uses CSS custom properties for easy color customization:

```css
:root {
    --primary-cyan: #00d4ff;
    --primary-pink: #ff0080;
    --primary-purple: #8b5cf6;
    --primary-green: #00ff9f;
}
```

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📱 Mobile Support

The game is fully responsive and supports touch controls on mobile devices.

## 🏆 Achievements

- **Level Master**: Complete level 5
- **Combo King**: Achieve a 10x combo
- **Perfect Aim**: Complete a level without losing a life

## 🔧 Technical Details

- Built with vanilla JavaScript (ES6+)
- HTML5 Canvas for rendering
- CSS Grid and Flexbox for layout
- LocalStorage for game saves
- Responsive design with CSS media queries

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

---

**Enjoy playing NEON BREAKOUT!** 🎮✨