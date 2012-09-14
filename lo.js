var $LO = function (object, events) {
	var liveObject = function (obj) {
		//console.log(obj);
		//console.log(this);

        this._id = 0;
        this.__or = [];

        this._buildingMode = true;
        var self = this;


        //this.__originalObject = obj;   //здесь хранится оригинальная копия объекта
        //все свойства заносятся в this

        //обойти рекурсивно весь объект
        this._buildLiveObject = function (object, parent) {  //,orig
            if(typeof object == "object") {
                for(var part in object) {

                    /* variant 1 */
                    //!if parent[part] != object!!
                    /*Object.defineProperty(orig, part, { value: object[part] });
                    (function (__orig) {
                        Object.defineProperty(parent, part, {
                            set: function (newValue) {
                                console.log('new value: ' + newValue);
                                //if(typeof newValue == "object") {
                                //    this._buildLiveObject(newValue, parent[part], __orig, 1);
                                //} else {
                                    __orig = newValue;
                                //}
                            },
                            get: function () {
                                return __orig;
                            }
                        });
                    })(orig[part]);
                    if(typeof object[part] == "object") this._buildLiveObject(object[part], parent[part], orig[part]);*/
                    /*/*/



                    /* variant 2.
                    *
                    * */
                    //var objPartType = this._getType(object[part]);
                    //if (objPartType != "object") {
                    if (typeof object[part] != "object") {
                        this.__or[this._id] = {};

                        //console.log(object[part].eventable);
                        if(object[part].eventable) {
                            this.__or[this._id].value = object[part].value;
                            this.__or[this._id].type = this._getType(object[part].value);
                            this.__or[this._id].handlers = object[part].handlers
                        } else {
                            this.__or[this._id].value = object[part];
                            this.__or[this._id].type = this._getType(object[part]);
                        }

                        (function (id, that) {
                            Object.defineProperty(parent, part, {
                                set: function (newValue) {
                                    console.log('set event');
                                    /* определиться - выполнять хэндлер до изменения или после
                                     * или задавать переключателем
                                     *
                                     * + не вызывать геттер!
                                     * */
                                    if(that.__or[id].handlers && that.__or[id].handlers['onSet']) {
                                        that.__or[id].handlers['onSet'].call(parent, newValue, parent, "set", that.__or[id]);
                                    } else if (that.__commonHandlers && that.__commonHandlers['onSet']) {
                                        that.__commonHandlers['onSet'].call(parent, newValue, parent, "set", that.__or[id]);
                                    }
                                    that.__or[id].value = newValue;
                                },
                                get: function () {

                                    if(self._buildingMode == true) {
                                        console.log('building mode');
                                        //return id;
                                    } else {

                                        if(that.__or[id].handlers && that.__or[id].handlers['onGet']) {
                                            //that.__or[id].handlers['onGet'].call(parent, that.__or[id].value, parent[part], "set", that.__or[id]);
                                            that.__or[id].handlers['onGet'].call(parent, that.__or[id].value, "get", that.__or[id]);
                                        } else if (that.__commonHandlers && that.__commonHandlers['onGet']) {
                                            that.__commonHandlers['onGet'].call(parent, that.__or[id].value, "get", that.__or[id]);
                                        }

                                        console.log('get event');
                                        if(that.__or[id].type == "computed") {
                                            return that.__or[id].value.call(parent, that, that.__or[id]); // that - очистить от лишних свойств и методов (__or, _getType и т.д.)
                                        }
                                    }
                                    return that.__or[id].value;
                                }
                            });
                        })(this._id, this);

                        this._id++;
                    }
                    //if(objPartType == "object") {
                    if(typeof object[part] == "object") {
                        parent[part] = object[part];

                        if(this._getType(object[part]) == "array") {

                            (function (that) {
                                that.push = function (value) {
                                    if(typeof value == "object") {

                                        that[that.length] = {};
                                        self._buildLiveObject(value, that[that.length-1]);

                                    } else {

                                        (function (id) {
                                            self.__or[id] = {};
                                            self.__or[id].value = value;
                                            self.__or[id].type = self._getType(value);

                                            Object.defineProperty(that, that.length, {
                                                set: function (newValue) {
                                                    console.log('array set event');
                                                    self.__or[id].value = newValue;
                                                },
                                                get: function () {
                                                    console.log('array get event');
                                                    return self.__or[id].value;
                                                }
                                            });
                                        })(self._id);
                                        self._id++;

                                    }
                                }
                            })(parent[part]);

                        }

                        this._buildLiveObject(object[part], parent[part]);

                        parent[part].parent = function () {
                            return parent;
                        };

                    }
                    /*/*/

                }
            } else {
                throw new Error("can't be a string");
                //придумать хак для строки
            }
        };

        /*this._buildLiveObject2 = function (object, parent) {
            for(var part in object) {
                var objPartType = this._getType(object[part]);
                if(objPartType == "object") {

                    this.__or[this._id] = {};

                    var _unrolled = {};
                    for(var name in object[part]) {
                        (function (_pp) {
                            if(self._getType(_pp) == 'object') {
                                _unrolled[name] = {
                                    "child": "object" //пропихивать чилдренов
                                    //узнать в какие ячейки запишется каждое из детей
                                }
                            } else {
                                _unrolled[name] = {
                                    "child": _pp //пропихивать чилдренов
                                    //узнать в какие ячейки запишется каждое из детей
                                }
                            }

                        })(parent[part][name]);
                    }
                    //console.log(_unrolled);

                    this.__or[this._id].value = _unrolled;
                    this.__or[this._id].type = objPartType;

                    (function (id, that) {
                        Object.defineProperty(parent, part, {
                            set: function (newValue) {
                                console.log('set event on dynamic object');
                                //var _unrolled = [];

                                //that.__or[id].value = newValue;
                            },
                            get: function () {
                                console.log('get event');
                                var bla = {};
                                for(var prop in that.__or[id].value) {
                                    //console.log(that.__or[id].value[i]);
                                    //bla[that.__or[id].value[i]] = 1;
                                    (function (a, b, c) {
                                        Object.defineProperty(a, b, {
                                            set: function (newVal) {
                                                //
                                                console.log('yeah!' + newVal);
                                            },
                                            get: function () {
                                                //
                                                console.log('yeah23');
                                            }
                                        });
                                    })(bla, prop, that);
                                }
                                return bla;
                            }
                        });
                    })(this._id, this);
                    this._id++;

                    this._buildLiveObject2(object[part], parent[part]);
                }
            }
        };*/

		this._getType = function (variable) {
            if(typeof variable === "object") {
                if(variable instanceof Array) return "array";
                return typeof variable;
            }
            if(typeof variable === "number") {
                //if (variable.indexOf(".") != -1) return "float";
                return typeof variable;
            }
            if(typeof variable === "function") {
                if(variable.computed === true) return "computed";
            }
            return typeof variable;
		};

        this.attachEvent = function (object, eventType, handler) {
            return object;
        };

        this._propBuilder = function (object, name, parent) {

            /*parent.__or[parent._id] = {};
            parent.__or[parent._id].value = object;
            parent.__or[parent._id].type = this._getType(object);

            (function (id, that) {
                Object.defineProperty(parent, name, {
                    set: function (newValue) {
                        console.log('set event');
                        that.__or[id].value = newValue;
                    },
                    get: function () {
                        console.log('get event');
                        return that.__or[id].value;
                    }
                });
            })(parent._id, parent);

            return {
                "array": function () {
                },
                "string": function () {
                },
                "int": function () {
                },
                "float": function () {
                },
                "default": function () {
                }
            }*/
        };

        this._buildLiveObject(obj, this);

        /* для оборачивания объектов */
        //this._buildLiveObject2(obj, this);
        /*/*/

        this._buildingMode = false;
	};

    var __lo = new liveObject(object);

    if(events !== undefined) {
        for(var event in events)
        //__lo.attachEvent(__lo, event, events[event]);
        __lo.__commonHandlers = events;
    }

	return __lo;
};

$LO.computed = function (f) {
    f.computed = true;
    return f;
};

$LO.eventable = function (value, handlers) {

    var _eventable = function () {};
        _eventable.eventable = true;
        _eventable.value = value;
        _eventable.handlers = handlers;
    return _eventable;
};

/* пример с сеттерами и геттерами
var obj = {

    get value () {

        return this._value;

    },

    set value (val) {

        this._value = val;

        alert( 'установили: ' + val );

    }

}


+ перехватывать push, pop, splice, etc для массивов,
    extends для объектов


obj.value = 3;
* */

//Варианты использования (выбрать лучший)
//var a = $LO({"test": "test"}).onChange = function (newValue, eventType) { ... };
//var a = $LO({"test": "test"}).attachEvent("change", function (newValue, eventType) { ... });
//var a = $LO({"test": "test"}, {"onChange": function (newValue, eventType) { ... }});
///var a = $LO({"test": ["test", { "onChange": function (newValue, eventType) {...} }]});
// eventType - set, get, push, pop, etc


//события:
/*
* onChange
* onPush, onPop, etc
* onExtends
* onGet
* */







/*

var b = {"test": "test",
                 "test2": {
                    "subtest": {
                        "subsubtest": 34
                    }
                 },
                 "test3": "blabla"};
Object.defineProperty(b, "test", {
    set: function (nv) {
        console.log(3434);
        var aaa = b.__lookupSetter__("test");
        Object.defineProperty(b, "test", {
            set: function () {
                return false;
            }
        });
        b.test = nv;
        b.test.__bla = 0;
        Object.defineProperty(b, "test", {
            set: aaa,
            get: function () {
                if(b.test.__bla == 0){
                    b.test.__bla = 1;
                    return b.test;
                } else return null;
            }
        });
    },
    get: function () {
        */
/*var bbb = b.__lookupGetter__("test");

        //b.___bla = 1;

        if(b.___bla == 0) {
            Object.defineProperty(b, "test", {
                get: function () {
                    return false;
                }
            });
            return b.test;
        } else {
            Object.defineProperty(b, "test", {
                get: function () {
                    return b.test;
                }
            });
        }

        b.___bla = 0;
        return b.test;*//*

        //return aaac;
        //var aaac = b.test;
        */
/*Object.defineProperty(b, "test", {
            get: function () {
                return false;
            }
        });*//*

        */
/*setTimeout(function () {
            Object.defineProperty(b, "test", {
                get: bbb
            });
        }, 100);
        return aaac;*//*

        */
/*Object.defineProperty(b, "test", {
            set: aaa
        });*//*

    }
});
*/
