topSuite("Ext.field.Slider", function() {
    var field;

    function createField(cfg) {
        field = new Ext.field.Slider(Ext.apply({
            renderTo: Ext.getBody(),
            width: 400
        }, cfg));
    }

    afterEach(function() {
        field = Ext.destroy(field);
    });

    describe('readOnly', function() {
        beforeEach(function() {
            createField({
                readOnly: true,
                value: 50,
                minValue: 0,
                maxValue: 100
            });
        });

        it('should not move thumb on tap', function() {
            var slider = field.getSlider();

            waitsFor(function() {
                return slider.getThumb().element.getX() > 0;
            });
            runs(function() {
                jasmine.fireMouseEvent(field.getSlider().element, 'click', 10, 10);
                expect(slider.getValue()).toBe(50);
            });
        });
    });

    describe("ARIA attributes", function() {
        describe("initial renderning", function() {
            it("should not render when !ariaRole", function() {
                createField({ ariaRole: undefined });
                expect(field.ariaEl.dom.hasAttribute('role')).toBe(false);
            });

            it("should render when ariaRole is defined", function() {
                createField();
                expect(field).toHaveAttr('role', 'slider');
            });

            it("In general", function() {
                createField();
                expect(field).toHaveAttr('aria-describedby', field.id + '-ariaStatusEl');
                expect(field).toHaveAttr('aria-labelledby', field.id + '-ariaStatusEl');
                expect(field).toHaveAttr('aria-invalid', 'false');
            });
        });

        describe("aria-readonly", function() {
            it("should have aria-readonly as false", function() {
                createField();
                expect(field).toHaveAttr('aria-readonly', 'false');
            });

            it("should have aria-readonly as true when readOnly is true", function() {
                createField({
                    readOnly: true
                });
                expect(field).toHaveAttr('aria-readonly', 'true');
            });
        });

        describe("aria-hidden", function() {
            it("should have aria-hidden as true when hidden is true", function() {
                createField({
                    hidden: true
                });
                expect(field).toHaveAttr('aria-hidden', 'true');
            });

            it("should have aria-hidden as false when hidden is false", function() {
                createField({
                    hidden: false
                });
                expect(field).toHaveAttr('aria-hidden', 'false');
            });
        });

        describe("aria-disabled", function() {
            it("should have aria-disabled as true when disabled is true", function() {
                createField({
                    disabled: true
                });
                expect(field).toHaveAttr('aria-disabled', 'true');
            });

            it("should have aria-disabled as false when disabled is false", function() {
                createField({
                    disabled: false
                });
                expect(field).toHaveAttr('aria-disabled', 'false');
            });
        });

        describe("via config", function() {
            it("should have aria-label when ariaLabel is set", function() {
                createField({
                    ariaLabel: "my slider"
                });
                expect(field).toHaveAttr('aria-label', 'my slider');
            });

            it("should have aria-describedby referencing status element when id is provided", function() {
                createField({
                    id: 'my-sliderfield'
                });
                expect(field).toHaveAttr('aria-describedby', field.id + '-ariaStatusEl');
            });
        });
    });
});
