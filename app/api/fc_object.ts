interface FCObjectInterface {
  modelAddProperty: (data: any) => void;
  modelCustomPropertyMapper: () => object;
  modelContainerPropertyGenericClass: () => object;
}

export class FCObject implements FCObjectInterface {
  private _data = null;
  constructor(data: any) {
    this._data = data;
  }
  modelAddProperty(data: any) {
    if (data) {
      for (let key in data) {
        let propertyKey = key;
        if (this.hasOwnProperty("modelCustomPropertyMapper")) {
          // @ts-ignore
          propertyKey = this.modelContainerPropertyGenericClass()[key]
            ? // @ts-ignore
              this.modelCustomPropertyMapper()[key]
            : key;
        }
        if (this.hasOwnProperty("modelContainerPropertyGenericClass")) {
          // @ts-ignore
          if (this.modelContainerPropertyGenericClass()[propertyKey]) {
            // @ts-ignore
            let Class = this.modelContainerPropertyGenericClass()[propertyKey];
            if (data[key] instanceof Array) {
              // @ts-ignore
              this[propertyKey] = [];
              for (let eachData of data[key]) {
                let obj = new Class(eachData);
                // @ts-ignore
                this[propertyKey].push(obj);
              }
            } else {
              // @ts-ignore
              this[propertyKey] = new Class(data[key]);
            }
            continue;
          }
        }
        // @ts-ignore
        this[propertyKey] = data[key];
      }
    }
  }

  modelCustomPropertyMapper = function () {
    return {};
  };

  modelContainerPropertyGenericClass = function () {
    return {};
  };
}
