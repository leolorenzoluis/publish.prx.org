import { VERSION_LENGTH, FILE_LENGTH } from './template.invalid';

describe('TemplateInvalid', () => {

  let model: any;
  const buildModel = (min, max) => {
    model = {
      lengthMinimum: min,
      lengthMaximum: max
    };
    return model;
  };

  describe('VERSION_LENGTH', () => {

    const build = (min, max) => VERSION_LENGTH(buildModel(min, max));

    it('allows both min and max to be null', () => {
      let invalid = build(null, null);
      expect(invalid('lengthMinimum', null)).toBeNull();
      expect(invalid('lengthMaximum', null)).toBeNull();
    });

    it('requires both min and max', () => {
      let invalid = build(null, 4);
      expect(invalid('lengthMinimum', null)).toMatch('Must set');
      invalid = build(4, null);
      expect(invalid('lengthMaximum', null)).toMatch('Must set');
    });

    it('checks for positive numbers', () => {
      let invalid = build(-1, 'b');
      expect(invalid('lengthMinimum', null)).toMatch('greater than 0');
      expect(invalid('lengthMaximum', null)).toMatch('is not a number');
    });

    it('compares the min and max', () => {
      let invalid = build(6, 4);
      expect(invalid('lengthMinimum', 6)).toMatch('less than maximum');
      expect(invalid('lengthMaximum', 4)).toMatch('greater than minimum');
    });

    it('also validates the other column', () => {
      let invalid = build(null, -1);
      expect(invalid('lengthMinimum', null)).toMatch('Must set');
      expect(invalid('lengthMaximum', null)).toMatch('greater than 0');
    });

  });

  describe('FILE_LENGTH', () => {

    const build = (min, max) => FILE_LENGTH(buildModel(min, max));

    it('compares the min and max', () => {
      let invalid = build(6, 4);
      expect(invalid('lengthMinimum', 6)).toMatch('less than maximum');
      expect(invalid('lengthMaximum', 4)).toMatch('greater than minimum');
    });

  });

});
