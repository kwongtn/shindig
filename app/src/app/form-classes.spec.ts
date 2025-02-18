import { BehaviorSubject } from "rxjs";

import { Firestore } from "@angular/fire/firestore";

import { FormProps } from "./form-classes";

describe('FormProps', () => {
  let formProps: FormProps;

  it('should create an instance with default values', () => {
    formProps = new FormProps();
    expect(formProps).toBeTruthy();
    expect(formProps.label).toBe('');
    expect(formProps.controlName).toBe('');
    expect(formProps.extra.fieldType).toBe('simpleText');
    expect(formProps.extra.required).toBe(false);
    expect(formProps.extra.display).toBe(true);
    expect(formProps.extra.disabled).toBe(false);
  });

  it('should create an instance with provided values', () => {
    const label = 'Test Label';
    const controlName = 'testControl';
    const extra = { fieldType: 'paragraphText', required: true, display: false, disabled: true, default: 'test' };
    formProps = new FormProps(label, controlName, extra);
    expect(formProps.label).toBe(label);
    expect(formProps.controlName).toBe(controlName);
    expect(formProps.extra.fieldType).toBe('paragraphText');
    expect(formProps.extra.required).toBe(true);
    expect(formProps.extra.display).toBe(false);
    expect(formProps.extra.disabled).toBe(true);
    expect(formProps.defaultValue).toBe('test');
  });

  it('should set default value based on fieldType if default is not provided', () => {
    const extra = { fieldType: 'checkbox' };
    formProps = new FormProps('','', extra);
    expect(formProps.defaultValue).toBe(false);
  });

  it('should set defaultValue to undefined if default is "undefined"', () => {
    const extra = { fieldType: 'simpleText', default: 'undefined' };
    formProps = new FormProps('', '', extra);
    expect(formProps.defaultValue).toBeUndefined();
  });

  it('should set isLoading to false after fetching options from Firestore', (done) => {
    const firestoreMock = {
      collection: jasmine.createSpy('collection').and.returnValue({}),
    } as any as Firestore;
    const extra = {
      firestore: firestoreMock,
      collection: 'testCollection',
      labelField: 'name',
    };

    formProps = new FormProps('', '', extra);

    // Wait for the asynchronous operation to complete
    setTimeout(() => {
      expect(formProps.$isLoading.value).toBe(false);
      done();
    }, 100); // Adjust the timeout as needed
  });
});
