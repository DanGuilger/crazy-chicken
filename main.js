//Cena do Menu Inicial
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('inicio', 'assets/inicio.png'); //Carrega a imagem de fundo do menu
    }

    create() {
        this.add.image(213.5, 480, 'inicio').setDisplaySize(427, 960); //Adiciona o fundo do menu

        this.add.text(25, 480, 'Pressione ENTER para jogar', { fontSize: '22px', fill: '#000' }); //Adiciona instruções para o jogador come;ar o jogo
        this.add.text(25, 530, 'Pressione ESPAÇO para pular', { fontSize: '22px', fill: '#000' }); //Adiciona instruções para o jogador pular durante o jogo
        this.add.text(22, 550, '(Pode ser precionado multiplas vezes, incluindo no ar)', { fontSize: '12px', fill: '#000' }); //Explica que pode pular várias vezes
        this.add.text(25, 590, 'Segure W para planar', { fontSize: '22px', fill: '#000' }); //Adiciona instruções para o jogador planar durante o jogo

        this.input.keyboard.on('keydown-ENTER', () => { //Configura a tecla ENTER para iniciar o jogo
            this.scene.start('GameScene'); //Inicia o jogo
        });
    }
}

class GameScene extends Phaser.Scene {//Tela do Jogo
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        //Carrega as sptites do jogo
        this.load.image('fundo', 'assets/fundo.png'); //Carrega a imagem de funco da tela de jogo
        this.load.spritesheet('galinha', 'assets/galinha.png', { frameWidth: 320, frameHeight: 320 }); //Carrega a galinha
        this.load.spritesheet('ovo', 'assets/ovo.png', { frameWidth: 120, frameHeight: 160 }); //Carrega o ovo
        this.load.image('tronco', 'assets/tronco.png'); //Carrega o tronco
        this.load.spritesheet('passaro', 'assets/passaro.png', { frameWidth: 320, frameHeight: 320 }); //Carrega o passaro
    }

    create() {
        // Detecta se o jogo está sendo executado em um dispositivo móvel
        this.isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS;

        this.fundo = this.add.tileSprite( //Adiciona o fundo do jogo com efeito de movimentação
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            3200,
            7200,
            'fundo'
        ).setDisplaySize(427, 960);

        this.galinha = this.physics.add.sprite(100, 750, 'galinha').setScale(0.4).setCollideWorldBounds(true); //Adiciona a galinha com física e cria barreiras para a sua movimentação

        this.anims.create({ //Cria a animação da galinha correndo
            key: 'correndo',
            frames: this.anims.generateFrameNumbers('galinha', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });

        this.galinha.play('correndo');

        // Adiciona suporte ao toque na tela para dispositivos móveis
        if (this.isMobile) {
            this.input.on('pointerdown', () => {
                this.galinha.setVelocityY(-1000); // Faz a galinha pular
                this.soltarOvo(); // Solta um ovo ao pular
            });
        }

        // Adiciona suporte ao teclado para desktops
        this.teclaEspaco = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Configura a tecla ESPAÇO para pular
        this.teclaW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W); // Configura a tecla W para planar

        this.troncos = this.physics.add.group({ //Cria e configura os troncos como obstáculos
            allowGravity: false //Evita que os troncos caiam com a fisica
        });
        this.gerarTronco();

        this.anims.create({ //Cria a animação do passaro do mal
            key: 'passaroVoando',
            frames: this.anims.generateFrameNumbers('passaro', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });

        this.passaros = this.physics.add.group({ //Grupo de pássaros
            allowGravity: false //Impede que os pássaros sejam afetados pela gravidade
        });
        
        this.gerarPassaros(); //Chama a função que cria os pássaros

        this.pontuacao = 0; //Configura a pontuação
        this.textoPontuacao = this.add.text(10, 20, 'Pontos: 0', {
            fontSize: '48px',
            fill: '#000000'
        });

        this.ovos = this.physics.add.group(); //Cria os ovos

        this.physics.add.collider(this.galinha, this.troncos, this.morrer, null, this); //Configura a colisão entre a galinha e os troncos
        this.physics.add.collider(this.galinha, this.passaros, this.colisaoPassaro, null, this); //Configura a colisão entre a galinha e os pássaros

        this.anims.create({ //Animação do ovo rachando
            key: 'ovoRachando',
            frames: this.anims.generateFrameNumbers('ovo', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: 0
        });

        // Adiciona suporte ao toque na tela
        this.input.on('pointerdown', () => {
            this.galinha.setVelocityY(-1000); // Faz a galinha pular
            this.soltarOvo(); // Solta um ovo ao pular
        });

    }

    update() {
        this.fundo.tilePositionX += 10; //Movimenta o fundo
    
        // Pulo normal com espaço (apenas para desktops)
        if (!this.isMobile && Phaser.Input.Keyboard.JustDown(this.teclaEspaco)) {
            this.galinha.setVelocityY(-1000); // Pulo
            this.soltarOvo();
        }

        // Planar com a tecla W (apenas para desktops)
        if (!this.isMobile && this.teclaW.isDown && this.galinha.body.velocity.y > 0) {
            this.galinha.setVelocityY(100); // Faz a galinha descer lentamente
        }

        if (!this.isMobile && !this.teclaW.isDown && this.galinha.body.velocity.y > 100) {
            this.galinha.setVelocityY(300); // Volta a cair normalmente
        }
    
        if (this.galinha.y > this.cameras.main.height - 300) { //Mantém a galinha dentro da altura limite da tela
            this.galinha.y = this.cameras.main.height - 300;
        }    

        this.ovos.children.each(ovo => { //Movimenta os ovos e remove os que saem da tela
            ovo.x -= 10; //Movimento do ovo para trás

            if (ovo.y >= this.cameras.main.height - 300) { //Faz o ovo acompanhar a galinha
                ovo.setVelocityY(0);
                ovo.y = this.cameras.main.height - 300;
            }

            if (ovo.x < -50) { //Remove o ovo quando ele sai da tela
                ovo.destroy();
            }
        });

        this.passaros.children.each(passaro => {
            if (passaro.x < -50) {
                passaro.destroy(); //Remove o pássaro da cena
            }
        });        

        this.troncos.children.each(tronco => { //Movimenta os troncos
            if (tronco.x < -50) {
                tronco.destroy();
                this.aumentarPontuacao(); //Aumenta a pontuação ao esquivar
            }
        });
    }

    gerarTronco() { //Função para gerar troncos
        this.time.addEvent({
            delay: 1750, //Intervalo entre os troncos
            loop: true,
            callback: () => {
                let tronco = this.troncos.create(
                    500, //Surge fora da tela
                    this.cameras.main.height - 275,
                    'tronco'
                ).setScale(0.2);

                tronco.setVelocityX(-300); //Move o tronco para a esquerda
                tronco.setImmovable(true); //Garante que a galinha colida corretamente
            }
        });
    }

    gerarPassaros() {
        this.time.addEvent({
            delay: 5000, //A cada 3 segundos, um pássaro aparece
            loop: true,
            callback: () => {
                let yRandom = Phaser.Math.Between(150, 500); //Define uma altura aleatória
                let passaro = this.passaros.create(500, yRandom, 'passaro')
                .setScale(0.5)
                .play('passaroVoando'); //Inicia a animação
            
            passaro.body.allowGravity = false; //Remove a gravidade
            passaro.setVelocityX(-250); //Se move para a esquerda
            
            }
        });
    }    

    soltarOvo() { //Função do ovo
        let ovo = this.ovos.create(
            this.galinha.x - 20, 
            this.galinha.y + 20, 
            'ovo'
        ).setScale(0.5);

        ovo.play('ovoRachando');

        ovo.setVelocityY(300);
        ovo.setVelocityX(300); //Move para esquerda

        this.time.delayedCall(3000, () => { //Faz o ovo desaparecer
            this.tweens.add({
                targets: ovo,
                alpha: 0,
                duration: 2000,
                onComplete: () => {
                    ovo.destroy();
                }
            });
        });
    }

    aumentarPontuacao() { //Função para aumentar a pontuação
        this.pontuacao += 100;
        this.textoPontuacao.setText(`Pontos: ${this.pontuacao}`);
    }

    colisaoPassaro() {
        this.scene.start('MenuScene'); //Retorna ao menu inicial
    }
    
    morrer() { //Função para caso de morte
        this.scene.start('MenuScene'); //Retorna ao menu inicial
    }
}

const config = { //Configuração do Phaser
    type: Phaser.AUTO,
    width: 427,
    height: 960,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 2000 }, debug: false }
    },
    scene: [MenuScene, GameScene], 
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
    
};

const game = new Phaser.Game(config); //Cria o jogo
