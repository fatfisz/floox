function walker(object, prefix, callback) {
  Object.keys(object).forEach((key) => {
    const value = object[key];
    const propertyName = prefix + key;

    if (typeof value === 'object' && !Array.isArray(value)) {
      walker(value, `${propertyName}.`, callback);
      return;
    }

    callback(propertyName, value, key);
  });
}

export default function forEachNestedProperty(object, callback) {
  walker(object, '', callback);
}
