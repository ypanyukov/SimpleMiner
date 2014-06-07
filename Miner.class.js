/**
 * Created by ypanyukov on 04.06.14.
 */


function isUndefined(variable) {
    return typeof variable == "undefined";
}

function drawElement(selector, parent, attributes) {
    var element = document.createElement(selector);

    if (!isUndefined(attributes))
        Object.keys(attributes).forEach(function (key) {
            var attribute = attributes[key];
            if (!isUndefined(attribute))
                element.setAttribute(key, attribute);
        });

    return parent.appendChild(element);
}

HTMLElement.prototype.addEvent = function (type, handler) {
    if (this.addEventListener)
        this.addEventListener(type, handler, false);
    else if (this.attachEvent)
        this.attachEvent("on" + type, handler);
};

HTMLElement.prototype.fireEvent = function (event) {
    var evt = null;
    if (document.createEventObject) {
        evt = document.createEventObject();
        return this.fireEvent('on' + event, evt)
    }
    else {
        evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true);
        return !this.dispatchEvent(evt);
    }
};

HTMLElement.prototype.addClass = function (className) {
    var classes = this.className.split(" ");
    if (classes.indexOf(className) == -1)
        classes.push(className);

    this.className = classes.join(" ").trim();
};

HTMLElement.prototype.removeClass = function (className) {
    var classes = this.className.split(" ");
    if (classes.indexOf(className) !== -1)
        classes.splice(classes.indexOf(className), 1);

    this.className = classes.join(" ").trim();
};

var Cell = function (parent, x, y) {
    var __this = this,
        nearBombClassName = 'bomb-near',
        flagClassName = 'flag',
        bombClassName = 'is-bomb';

    this.x = x;
    this.y = y;
    this.isBomb = false;
    this.check = false;
    this.flag = false;
    this.bombNear = 0;
    this.element = null;

    this.render = function (addClass) {
        __this.element = drawElement('button', parent, { 'class': addClass });
    };

    this.onClick = function (callback) {
        __this.element.addEvent('click', function (e) {
            if (!isUndefined(callback))
                callback(__this, e);
        });
    };

    this.onRightClick = function (callback) {
        __this.element.addEvent('contextmenu', function (e) {
            e.preventDefault();
            if (!__this.check) {
                callback(__this, e);
            }
        });
    };

    this.openCell = function () {
        __this.disabled = "disabled";
        if (__this.isBomb)
            __this.element.addClass(bombClassName);
        else {
            __this.element.addClass(nearBombClassName + __this.bombNear);
            if (__this.bombNear > 0)
                __this.element.innerHTML = __this.bombNear;
        }
    };

    this.toggleFlag = function () {
        if (!__this.flag)
            __this.element.addClass(flagClassName);
        else
            __this.element.removeClass(flagClassName);

        __this.flag = !__this.flag;
    };
};

var Miner = function (container, width, height, bombCount, hint) {

    var __this = this,
        minerFieldClassName,
        elements,
        __width,
        __height,
        rightFlags,
        flags = 0,
        openCells,
        field,
        bombCountElement,
        bombCountElementCallback,
        flagElement,
        flagElementCallback,
        defaultParams,
        gameIsOver,
        date,
        timeOfGame;

    function setToDefault(params) {
        date = new Date();
        timeOfGame = 0;
        __this.minerId = date.getHours() + '' + date.getMinutes() + '' + date.getSeconds();
        minerFieldClassName = 'miner-field-' + __this.minerId;
        elements = [];
        openCells = 0;
        rightFlags = 0;
        gameIsOver = false;

        if (!isUndefined(params)) {
            defaultParams = params;
            if (!isUndefined(params.width)) {
                params.width = parseInt(Number(params.width));
                __width = params.width < 3 ? 10 : params.width;
            }
            if (!isUndefined(params.height)) {
                params.height = parseInt(Number(params.height));
                __height = params.height < 3 ? 10 : params.height;
            }
            if (!isUndefined(params.width) && !isUndefined(params.height) && isUndefined(params.bombCount))
                bombCount = __width * __height * 0.15625;
            else if (!isUndefined(params.bombCount))
                bombCount = (params.bombCount < 1 || params.bombCount > __width * __height - 1) ? __width * __height * 0.15625 : params.bombCount;
        }
        else {
            __width = width < 3 ? 10 : width;
            __height = height < 3 ? 10 : height;
            bombCount = (isUndefined(bombCount) || bombCount < 1 || bombCount > __width * __height - 1) ? __width * __height * 0.15625 : bombCount;
        }

        setBombCount(parseInt(bombCount));
        setFlagCount(0);
    }

    function drawField() {
        field = drawElement('div', container, { 'class': minerFieldClassName });

        if (!isUndefined(field)) {
            for (var i = 0; i < __height; i++) {
                elements[i] = [];
                for (var j = 0; j < __width; j++) {
                    var addClass = j == 0 ? 'break-line' : undefined,
                        cell = new Cell(field, i, j);

                    cell.render(addClass);
                    cell.onClick(elementClick);
                    cell.onRightClick(elementRightClick);
                    elements[i].push(cell);
                }
            }
            field.style.width = __width * 20 + 'px';
        }
        return field;
    }

    function elementClick(cell) {
        if (cell.flag || cell.check || gameIsOver)
            return false;

        cell.check = true;
        openCells++;

        cell.bombNear = findBombNear(cell);

        cell.openCell();

        if (cell.isBomb) {
            openAllCell(true);
            gameOver('lose');
            return false;
        }

        if (__width * __height - openCells == bombCount) {
            openAllCell();
            gameOver('win');
            return false;
        }
    }

    function elementRightClick(cell) {
        if (gameIsOver)
            return false;

        if (cell.isBomb) {
            if (!cell.flag)
                rightFlags++;
            else
                rightFlags--;
        }

        if (!cell.flag)
            setFlagCount(flags + 1);
        else
            setFlagCount(flags - 1);

        cell.toggleFlag();


        if (rightFlags == bombCount) {
            openAllCell();
            gameOver('win');
            return false;
        }
    }

    function findBombNear(cell) {
        var allNearElements = getAllNearElements(cell),
            nearBombCount = 0;

        if (allNearElements.length > 0) {
            allNearElements.forEach(function (e) {
                nearBombCount += Number(e.isBomb);
            });
        }

        if (nearBombCount == 0) {
            allNearElements.forEach(function (e) {
                if (e.check == false)
                    elementClick(e);
            });
        }

        return nearBombCount;
    }

    function getElementByXY(x, y) {
        try {
            return elements[x][y];
        }
        catch (e) {
        }
    }

    function getAllNearElements(cell) {
        var returnElements = [];

        returnElements.push(getElementByXY(cell.x, cell.y + 1));
        returnElements.push(getElementByXY(cell.x, cell.y - 1));
        returnElements.push(getElementByXY(cell.x + 1, cell.y + 1));
        returnElements.push(getElementByXY(cell.x + 1, cell.y - 1));
        returnElements.push(getElementByXY(cell.x + 1, cell.y));
        returnElements.push(getElementByXY(cell.x - 1, cell.y + 1));
        returnElements.push(getElementByXY(cell.x - 1, cell.y - 1));
        returnElements.push(getElementByXY(cell.x - 1, cell.y));

        returnElements = returnElements.filter(function (el) {
            return !isUndefined(el);
        });

        return returnElements;
    }

    function setBomb() {
        var bombOnPlace = 0;

        while (bombOnPlace !== bombCount) {
            var rndElement = Math.floor(Math.random() * __width * __height),
                row = parseInt(rndElement / __height),
                col = rndElement % __width,
                cell = elements[row][col];

            if (!cell.isBomb) {
                cell.isBomb = true;
                if (hint === true)
                    cell.element.innerHTML = '*'; //comment after check
                bombOnPlace++;
            }
        }
    }

    function timeOfGameFormat(timeOfGame) {
        timeOfGame = parseInt(timeOfGame / 1000);
        var hours = parseInt(timeOfGame / 60 / 60),
            minutes = parseInt((timeOfGame - hours * 60 * 60) / 60),
            seconds = parseInt(timeOfGame - hours * 60 * 60 - minutes * 60);

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        return hours + ':' + minutes + ':' + seconds;
    }

    function gameOver(gameState) {
        gameIsOver = true;
        timeOfGame = (new Date()).getTime() - date.getTime();
        var message = "",
            timeOfGameString = timeOfGameFormat(timeOfGame);
        switch (gameState) {
            case 'win':
                message = 'You win! ';
                break;
            case 'lose':
                message = 'You lose! ';
                break;
        }
        message += 'Your time is - ' + timeOfGameString + '. Game over! Could you play again?';
        if (window.confirm(message))
            __this.startNewGame(defaultParams);
    }

    function openAllCell(onlyBomb) {
        for (var i = 0; i < __height; i++) {
            for (var j = 0; j < __width; j++) {
                var cell = elements[i][j];
                if (!isUndefined(onlyBomb)) {
                    if (cell.isBomb)
                        cell.openCell();
                }
                else
                    cell.openCell();
            }
        }
    }

    this.clearField = function () {
        if (!isUndefined(field))
            field.parentNode.removeChild(field);
    };

    var setFlagCount = function (newValue) {
        if (!isUndefined(newValue))
            flags = Number(newValue);

        if (!isUndefined(flagElement))
            __this.writeFlagCountTo(flagElement, flagElementCallback);
        else
            return false;

        return true;
    };

    var setBombCount = function (newValue) {
        if (!isUndefined(newValue))
            bombCount = Number(newValue);

        if (!isUndefined(bombCountElement))
            __this.writeBombCountTo(bombCountElement, bombCountElementCallback);
        else
            return false;

        return true;
    };

    this.writeFlagCountTo = function (element, callback) {
        if (element instanceof HTMLElement) {
            flagElement = element;

            if (!isUndefined(callback))
                flagElementCallback = callback;

            if (isUndefined(flagElementCallback))
                flagElement.innerHTML = flags;
            else
                flagElementCallback(flags);
        }
    };

    this.writeBombCountTo = function (element, callback) {
        if (element instanceof HTMLElement) {
            bombCountElement = element;

            if (!isUndefined(callback))
                bombCountElementCallback = callback;

            if (isUndefined(bombCountElementCallback))
                bombCountElement.innerHTML = bombCount;
            else
                bombCountElementCallback(bombCount);
        }
    };

    this.getBombCount = function () {
        return bombCount;
    };

    this.startNewGame = function (params) {
        __this.clearField();
        setToDefault(params);

        var minerField = drawField();
        if (minerField) {
            setBomb();
            return minerField;
        }
        return false;
    };
};