topSuite('Ext.signature.Signature', ['Ext.signature.*', 'Ext.Container'], function() {
    var signature, container;

    function createSignaturePad(config) {
    container = Ext.create({
        xtype: 'container',
        width: 620,
        height: 320,
        renderTo: Ext.getBody(),
        items: [
            Ext.apply({
                xtype: 'signature',
                width: 600,
                height: 300
            }, config)
        ]
    });

    signature = container.down('signature');
}

    afterEach(function() {
        if (signature || container) {
            Ext.destroy(signature, container);
        }

        signature = container = null;
    });

    describe('Signature component creation', function() {
        it('should create the component and render canvas', function() {
            createSignaturePad();
            waitsFor(function() {
                return signature.element;
            });

            runs(function() {
                var canvas = signature.element;

                expect(canvas).toBeDefined();
                expect(canvas.isVisible()).toBe(true);
            });
        });

        it('should not initialize SignaturePad if library not loaded', function() {
            var sigBackup = window.SignaturePad;

            window.SignaturePad = undefined;
            createSignaturePad();

            waitsFor(function() {
                return signature.el;
            });

            runs(function() {
                expect(signature.el.getText()).toContain('SignaturePad library not loaded');
                window.SignaturePad = sigBackup;
            });

        });
    });

    describe('Signature methods', function() {
        beforeEach(function() {
            createSignaturePad();

            waitsFor(function() {
                return signature.getSignaturePad();
            });
        });

        it('should call clear method in the canvas', function() {
            runs(function() {
                var sp = signature.getSignaturePad();

                spyOn(sp, 'clear');
                signature.clear();
                expect(sp.clear).toHaveBeenCalled();
            });
        });

        it('should detect if canvas is empty', function() {

            waitsFor(function() {
                return signature.getSignaturePad();
            });

            runs(function() {
                expect(signature.isEmpty()).toBe(true);
            });
        });

        it('should return point data', function() {
            var mockData = [[{ x: 1, y: 2 }]],
                toDataSpy = jasmine.createSpy('toDataSpy');

            toDataSpy.andReturn(mockData);

            spyOn(signature, 'getSignaturePad').andReturn({
                toData: toDataSpy
            });

            expect(signature.getToData()).toBe(mockData);
        });

        it('should call SignaturePad.fromData with provided data', function() {
            runs(function() {
                var sp = signature.getSignaturePad(),
                    data = [[{ x: 10, y: 20 }]];

                spyOn(sp, 'fromData');

                signature.fromData(data);
                expect(sp.fromData).toHaveBeenCalledWith(data);
            });
        });

        it('should undo the last stroke', function() {
            var mockData = [[{ x: 1 }], [{ x: 2 }]],
                sp = {
                    toData: jasmine.createSpy('toData').andReturn(mockData),
                    fromData: jasmine.createSpy('fromData')
                };

            spyOn(signature, 'getSignaturePad').andReturn(sp);

            signature.undo();

            expect(signature.redoBuffer.length).toBe(1);
            expect(sp.fromData).toHaveBeenCalledWith([[{ x: 1 }]]);
        });

        it('should redo the last undone stroke', function() {
            var existingData = [[{ x: 1 }]],
                sp = {
                    toData: jasmine.createSpy('toData').andReturn(existingData),
                    fromData: jasmine.createSpy('fromData')
                };

            spyOn(signature, 'getSignaturePad').andReturn(sp);

            signature.redoBuffer.push([{ x: 2 }]);

            signature.redo();

            expect(sp.fromData).toHaveBeenCalledWith([[{ x: 1 }], [{ x: 2 }]]);
        });
    });

    describe('Dynamic updates', function() {
        beforeEach(function() {
            createSignaturePad();

            waitsFor(function() {
                return signature.getSignaturePad();
            });
        });

        it('should update pen color', function() {
            runs(function() {
                signature.setPenColor('#123456');
                expect(signature.getSignaturePad().penColor).toBe('#123456');
            });
        });

        it('should update background color', function() {
            runs(function() {
                var sp = signature.getSignaturePad();

                // Spy on clear to ensure it gets called when background color changes
                spyOn(sp, 'clear');
                signature.setBackgroundColor('#ffffff');
                expect(sp.backgroundColor).toBe('#ffffff');
            });
        });

        it('should update pen stroke width', function() {
            runs(function() {
                var sp;

                signature.setPenStrokeWidth(4);
                sp = signature.getSignaturePad();

                expect(sp.penStrokeWidth).toBe(4);
                expect(sp.minWidth).toBeGreaterThan(1);
            });
        });

        it('should update minWidth and maxWidth', function() {
            var sp;

            signature.setPenStrokeWidth(2);

            sp = signature.getSignaturePad();

            expect(sp.minWidth).toBe(1);
            expect(sp.maxWidth).toBe(2);
        });

    });

    describe('SignaturePad event firing with pointer events', function() {

        it('should fire `signaturestart` and `signatureend` via pointer event simulation', function() {
            var started = false,
                ended = false;

            createSignaturePad({
                listeners: {
                    beginStroke: function() {
                        started = true;
                    },
                    endStroke: function() {
                        ended = true;
                    }
                }
            });

            waitsFor(function() {
                return signature.getSignaturePad() && signature.canvas;
            });

            runs(function() {
                var canvas = signature.canvas.dom,
                    // Triangle coordinates (relative to canvas)
                    pointA = { x: 100, y: 100 },
                    pointB = { x: 150, y: 50 },
                    pointC = { x: 200, y: 100 };

                function dispatch(type, x, y, options) {
                    options = options || {};
                    var eventOptions = {
                        pointerType: 'pen',
                        clientX: x,
                        clientY: y,
                        buttons: type !== 'pointerup' ? 1 : 0,
                        bubbles: true
                    },
                    key;

                    for (key in options) {
                        if (options.hasOwnProperty(key)) {
                            eventOptions[key] = options[key];
                        }
                    }

                    canvas.dispatchEvent(new PointerEvent(type, eventOptions));
                }

                // Simulate triangle stroke
                dispatch('pointerdown', pointA.x, pointA.y);   // Start at A
                dispatch('pointermove', pointB.x, pointB.y);   // Move to B
                dispatch('pointermove', pointC.x, pointC.y);   // Move to C
                dispatch('pointermove', pointA.x, pointA.y);   // Close back to A
                dispatch('pointerup', pointA.x, pointA.y);     // End
            });

            waitsFor(function() {
                return started && ended;
            });

            runs(function() {
                expect(started).toBe(true);
                expect(ended).toBe(true);
            });
        });

    });

    describe('Destruction', function() {
        it('should clean up signaturePad and listeners', function() {
            createSignaturePad();

            runs(function() {
                signature.destroy();
                Ext.destroy(container);
                expect(signature.destroyed).toBe(true);
            });
        });
    });
});
