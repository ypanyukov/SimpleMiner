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
    if (document.createEventObject) {
        var evt = document.createEventObject();
        return this.fireEvent('on' + event, evt)
    }
    else {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true);
        return !this.dispatchEvent(evt);
    }
}

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

var Miner = function (container, width, height, bombCount) {

    __this = this;

    this.minerId = '';

    var minerFieldClassName,
        elements,
        __x,
        __y,
        rightFlags = 0,
        flags = 0,
        openCells = 0,
        field,
        bombCountElement,
        flagElement;

    function setToDefault(params) {
        var date = new Date();
        __this.minerId = date.getHours() + '' + date.getMinutes() + '' + date.getSeconds();
        minerFieldClassName = 'miner-field-' + __this.minerId;
        elements = [];
        openCells = 0;
        rightFlags = 0;
        setFlagCount(0);

        if (!isUndefined(params)) {
            if (!isUndefined(params.width)) {
                params.width = Number.parseInt(params.width);
                __x = params.width < 3 ? 10 : params.width;
            }
            if (!isUndefined(params.height)) {
                params.height = Number.parseInt(params.height);
                __y = params.height < 3 ? 10 : params.height;
            }
            if (!isUndefined(params.width) && !isUndefined(params.height) && isUndefined(params.bombCount))
                bombCount = __x * __y * 0.15625;
            else if (!isUndefined(params.bombCount))
                bombCount = (params.bombCount < 1 || params.bombCount > __x * __y - 1) ? __x * __y * 0.15625 : params.bombCount;
        }
        console.log(bombCount);
        setBombCount(Number.parseInt(bombCount));
    }

    function drawField() {
        field = drawElement('div', container, { 'class': minerFieldClassName });

        if (field) {
            for (var i = 0; i < __y; i++) {
                elements[i] = [];
                for (var j = 0; j < __x; j++) {
                    var addClass = j == 0 ? 'break-line' : undefined,
                        cell = new Cell(field, i, j);

                    cell.render(addClass);
                    cell.onClick(elementClick);
                    cell.onRightClick(elementRightClick);
                    elements[i].push(cell);
                }
            }
            field.style.width = __x * 20 + 'px';
        }
        return field;
    }

    function elementClick(cell) {
        openCells++;

        if (cell.isBomb) {
            openAllCell();
            gameOver('lose');
            return false;
        }

        cell.bombNear = findBombNear(cell);
        cell.openCell();

        if (__x * __y - openCells == bombCount) {
            openAllCell();
            gameOver('win');
            return false;
        }
    }

    function elementRightClick(cell) {
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

        cell.check = true;

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
        console.log(bombCount, __x, __y);
        while (bombOnPlace !== bombCount) {
            var rndElement = Math.floor(Math.random() * __x * __y),
                row = Number.parseInt(rndElement / __y),
                col = rndElement % __x,
                cell = elements[row][col];

            if (!cell.isBomb) {
                cell.isBomb = true;
                //cell.element.innerHTML = '*'; //comment after check
                bombOnPlace++;
            }
        }
    }

    function gameOver(gameState) {
        var message = "";
        switch (gameState) {
            case 'win':
                message = 'You win! ';
                break;
            case 'lose':
                message = 'You lose! ';
                break;
        }
        if (window.confirm(message + 'Game over! Could you play again?'))
            __this.startNewGame();
    }

    function openAllCell() {
        for (var i = 0; i < __y; i++) {
            for (var j = 0; j < __x; j++) {
                elements[i][j].openCell();
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
            __this.writeFlagCountTo(flagElement);
        else
            return false;

        return true;
    };

    var setBombCount = function (newValue) {
        if (!isUndefined(newValue))
            bombCount = Number(newValue);
        if (!isUndefined(bombCountElement))
            __this.writeBombCountTo(bombCountElement);
        else
            return false;

        return true;
    };

    this.writeFlagCountTo = function (element) {
        if (element instanceof HTMLElement) {
            flagElement = element;
            flagElement.innerHTML = flags;
        }
    };

    this.writeBombCountTo = function (element) {
        if (element instanceof HTMLElement) {
            bombCountElement = element;
            bombCountElement.innerHTML = bombCount;
        }
    };

    this.startNewGame = function (params) {
        setToDefault(params);
        __this.clearField();
        var minerField = drawField();
        if (minerField) {
            setBomb();
            return minerField;
        }
    };

    this.startNewGame({
        width: width,
        height: height,
        bombCount: bombCount
    });
};