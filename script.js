
let scene, camera, renderer, paddle, ball, bricks = [], paddleSpeed = 0.5, ballSpeed = 0.1;
let ballDirection = { x: 1, y: 1 }, score = 0, isGameOver = false;

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(directionalLight);

    // Create paddle
    const paddleGeometry = new THREE.BoxGeometry(2, 0.5, 1);
    const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle.position.set(0, -3, 0);
    scene.add(paddle);

    // Create ball
    const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    // Create colorful bricks
    const brickGeometry = new THREE.BoxGeometry(1, 0.5, 0.5);
    const brickColors = [0xff5733, 0xffbd33, 0x33ff57, 0x33ffbd, 0x5733ff, 0xff33a8];
    for (let i = -4; i <= 4; i++) {
        for (let j = 1; j <= 3; j++) {
            const brickMaterial = new THREE.MeshStandardMaterial({ color: brickColors[(i + 4 + j) % brickColors.length] });
            const brick = new THREE.Mesh(brickGeometry, brickMaterial);
            brick.position.set(i * 1.2, j * 0.7, 0);
            scene.add(brick);
            bricks.push(brick);
        }
    }

    camera.position.z = 10;

    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.getElementById('resetButton').addEventListener('click', resetGame);

    // Initial ball setup
    resetBall();
}

function onDocumentKeyDown(event) {
    if (isGameOver) return;

    const keyCode = event.which;
    if (keyCode == 37) { // Left arrow
        if (paddle.position.x > -4) {
            paddle.position.x -= paddleSpeed;
        }
    } else if (keyCode == 39) { // Right arrow
        if (paddle.position.x < 4) {
            paddle.position.x += paddleSpeed;
        }
    }
}

function animate() {
    if (isGameOver) return;

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // Move ball
    ball.position.x += ballSpeed * ballDirection.x;
    ball.position.y += ballSpeed * ballDirection.y;

    // Ball collision with walls
    if (ball.position.x <= -5 || ball.position.x >= 5) {
        ballDirection.x *= -1;
    }
    if (ball.position.y >= 5) {
        ballDirection.y *= -1;
    }
    if (ball.position.y <= -5) {
        endGame();
    }

    // Ball collision with paddle
    if (ball.position.y <= paddle.position.y + 0.35 && 
        ball.position.y >= paddle.position.y - 0.35 &&
        ball.position.x >= paddle.position.x - 1.1 &&
        ball.position.x <= paddle.position.x + 1.1) {
        ballDirection.y *= -1;
        // Adjust ball's x direction slightly based on where it hit the paddle
        ballDirection.x = 2 * ((ball.position.x - paddle.position.x) / paddle.geometry.parameters.width);
    }

    // Ball collision with bricks
    bricks.forEach((brick, index) => {
        // Bounding box collision detection
        const brickBB = new THREE.Box3().setFromObject(brick);
        const ballBB = new THREE.Box3().setFromObject(ball);

        if (brickBB.intersectsBox(ballBB)) {
            ballDirection.y *= -1;
            scene.remove(brick);
            bricks.splice(index, 1);
            updateScore();
        }
    });
}

function updateScore() {
    score += 10;
    document.getElementById('score').innerText = `Score: ${score}`;
}

function endGame() {
    isGameOver = true;
    document.getElementById('gameOver').style.display = 'block';
}

function resetGame() {
    isGameOver = false;
    score = 0;
    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('gameOver').style.display = 'none';

    // Reset ball and paddle position
    resetBall();
    paddle.position.set(0, -3, 0);

    // Reset bricks
    bricks.forEach(brick => scene.remove(brick));
    bricks = [];
    const brickGeometry = new THREE.BoxGeometry(1, 0.5, 0.5);
    const brickColors = [0xff5733, 0xffbd33, 0x33ff57, 0x33ffbd, 0x5733ff, 0xff33a8];
    for (let i = -4; i <= 4; i++) {
        for (let j = 1; j <= 3; j++) {
            const brickMaterial = new THREE.MeshStandardMaterial({ color: brickColors[(i + 4 + j) % brickColors.length] });
            const brick = new THREE.Mesh(brickGeometry, brickMaterial);
            brick.position.set(i * 1.2, j * 0.7, 0);
            scene.add(brick);
            bricks.push(brick);
        }
    }

    animate(); // Restart animation
}

function resetBall() {
    ball.position.set(0, -2.5, 0);
    ballDirection = { x: (Math.random() < 0.5 ? -1 : 1), y: 1 };
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
