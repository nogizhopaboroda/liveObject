var $LO = function (object, events) {
	var liveObject = function (obj) {
        this._id = 0;
        this.__or = [];

        this._buildingMode = true;
        this._redefineMode;
        var self = this;

        this._buildLiveObject = function (object, parent) {
            if(typeof object == "object") {
                for(var part in object) {

                    if (typeof object[part] != "object") {
                        this.__or[this._id] = {};

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

                                    if(that.__or[id].handlers && that.__or[id].handlers['onSet']) {
                                        that.__or[id].handlers['onSet'].call(parent, newValue, parent, "set", that.__or[id]);
                                    } else if (that.__commonHandlers && that.__commonHandlers['onSet']) {
                                        that.__commonHandlers['onSet'].call(parent, newValue, parent, "set", that.__or[id]);
                                    }
                                    that.__or[id].value = newValue;
                                },
                                get: function () {

                                    if(self._redefineMode == true) {
                                        return id;
                                    }

                                    if(self._buildingMode == true) {
                                        console.log('building mode');
                                        //return id;
                                    } else {

                                        if(that.__or[id].handlers && that.__or[id].handlers['onGet']) {
                                            that.__or[id].handlers['onGet'].call(parent, that.__or[id].value, "get", that.__or[id]);
                                        } else if (that.__commonHandlers && that.__commonHandlers['onGet']) {
                                            that.__commonHandlers['onGet'].call(parent, that.__or[id].value, "get", that.__or[id]);
                                        }

                                        console.log('get event');
                                        if(that.__or[id].type == "computed") {
                                            return that.__or[id].value.call(parent, that, that.__or[id]);
                                        }
                                    }
                                    return that.__or[id].value;
                                }
                            });
                        })(this._id, this);

                        this._id++;
                    }
                    if(typeof object[part] == "object") {
                        parent[part] = object[part];

                        if(this._getType(object[part]) == "array") {

                            (function (that) {
                                that.push = function (value) {

                                    if (self.__commonHandlers && self.__commonHandlers['onPush']) {
                                        self.__commonHandlers['onPush'].call(parent, value, "push");
                                    }

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
                                };

                                that.delete = function (index) {
                                    self._redefineMode = true;
                                    var _fieldIndex = that[index];
                                    self._redefineMode = false;

                                    if (self.__commonHandlers && self.__commonHandlers['onDelete']) {
                                        self.__commonHandlers['onDelete'].call(parent, index, "delete", (self.__or[ _fieldIndex ] ? self.__or[ _fieldIndex ] : undefined) );
                                    }

                                    self.__or[ _fieldIndex ] = null;

                                    that.splice(index, index + 1);
                                    /* or
                                    *  delete that[index];
                                    *  that.length--;
                                    *  if need should redefine splice();
                                    * */
                                 };
                            })(parent[part]);
                        }

                        this._buildLiveObject(object[part], parent[part]);

                        parent[part].parent = function () {
                            return parent;
                        };
                    }
                }
            } else {
                throw new Error("can't be a string");
            }
        };

		this._getType = function (variable) {
            if(typeof variable === "object") {
                if(variable instanceof Array) return "array";
                return typeof variable;
            }
            if(typeof variable === "number") {
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

        this._buildLiveObject(obj, this);
        this._buildingMode = false;
	};

    var __lo = new liveObject(object);

    if(events !== undefined) {
        for(var event in events)
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