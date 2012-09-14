var a = $LO({"test": "test",
             "test2": {
                "subtest": {
                    "subsubtest": 34,
                    "subsubtest2": {
                        "subsubsubtest": "yeah!"
                    }
                },
                 "subtest2": "subtest2",
                 "subfunction": function () {
                     console.log('...work');
                 },
                 "subarray": [1,2,3,4],
                 "subarray2": [
                     {"a": "b"},
                     {"c": "d"}
                 ],
                 "computedValue": $LO.computed(function (root, dataField) {

                    /* this здесь родительский объект (test2)
                    *  root - родительский LiveObject
                    *  dataField - ячейка с оригинальными данными
                    * */

                     console.log(this.parent().test);

                     return this.subarray[2] + " computed function work!";
                 }),
                 "eventable": $LO.eventable("eventable function", {
                     "onSet": function (newValue, eventTarget, eventType, dataField) {
                         console.log('on set handler. responsed value: ' + newValue);
                         console.log(eventTarget);
                         console.log(eventType);
                         console.log(dataField);
                     },
                     "onGet": function (value, eventType, dataField) {
                         console.log('on get handler. value: ' + value);
                         console.log(this);
                         console.log(eventType);
                         console.log(dataField);
                     }
                 })
             },
             "test3": "blabla"
             }, {
                /* common events handlers */
                "onSet": function (newValue, eventTarget, eventType, dataField) {
                     console.log('common set handler. responsed value: ' + newValue);
                },
                "onGet": function (value, eventType, dataField) {
                     console.log('common get handler. value: ' + value);
                }
             });