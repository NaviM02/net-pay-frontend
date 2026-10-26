import { ConfirmActionService } from '../../services/other/confirm-action.service';

const defaultConfirmData = {
  title: 'txt_confirm',
  titleHelper: '',
  bodyQuestion: 'txt_confirm_want_to_proceed',
  bodyText: '',
  buttonType: 'btn-danger',
  confirmText: 'txt_confirm',
  cancelText: 'txt_cancel',
};

type ConfirmValue = string | ((ctx: any, args: any[]) => string);

/**
 * Decorator to display a confirmation dialog before executing the decorated method.
 * Requires `ConfirmActionService` to be injected in the class constructor to work.
 *
 * @example
 * ```typescript
 * import { ConfirmActionService } from 'path-to-confirm-action.service';
 *
 *  @Component({
 *    // component metadata here
 *  })
 *  export class SomeComponent {
 *    constructor(private confirmActionService: ConfirmActionService) {
 *      // Injection is necessary for the decorator to work
 *    }
 *
 *    @confirmAction({
 *      title: 'txt_are_you_sure',
 *      bodyQuestion: 'txt_confirm_really_want_do_it',
 *      confirmText: 'txt_yes_do_it',
 *      cancelText: 'txt_cancel'
 *    })
 *    someMethod() {
 *      // Method logic here
 *    }
 *  }
 *  ```
 *
 * @param data
 */
export function confirmAction(data: {
  title?: ConfirmValue;
  titleHelper?: ConfirmValue;
  bodyQuestion?: ConfirmValue;
  bodyText?: ConfirmValue;
  buttonType?: string;
  confirmText?: string;
  cancelText?: string;
}) {
  return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    function resolve(value: any, ctx: any, args: any[]) {
      if (typeof value === 'function') return value(ctx, args);
      return value;
    }

    descriptor.value = async function (...args: any) {
      const confirmActionService = ConfirmActionService.getInstance();
      if (!confirmActionService) {
        console.error('ConfirmActionService not injected properly.');
        return;
      }

      const finalData = {
        title: resolve(data.title ?? defaultConfirmData.title, this, args),
        titleHelper: resolve(data.titleHelper ?? defaultConfirmData.titleHelper, this, args),
        bodyQuestion: resolve(data.bodyQuestion ?? defaultConfirmData.bodyQuestion, this, args),
        bodyText: resolve(data.bodyText ?? defaultConfirmData.bodyText, this, args),
        buttonType: data.buttonType ?? defaultConfirmData.buttonType,
        confirmText: data.confirmText ?? defaultConfirmData.confirmText,
        cancelText: data.cancelText ?? defaultConfirmData.cancelText,
      };

      confirmActionService.confirm(finalData)
        .subscribe({
          next: (confirm) => {
            if (confirm) originalMethod.apply(this, args);
          },
          error: () => {}
        });
    };

    return descriptor;
  };
}
