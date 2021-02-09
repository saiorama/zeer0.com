export const zUtils = {
  methods: {
    //return unique template {{var.iab.les}} from template string
    extractTemplateVariables(templateString) {
        const varsRegex = /{{[a-z][a-z0-9]+(\.?[a-z][a-z0-9]+){0,}}}/gi;
        let vars = templateString.replaceAll(/\s/g, '').match(varsRegex);
        if(vars) return vars.sort().map(v => v.replaceAll('{', '').replaceAll('}', '')).filter((val,index, arr) => arr.indexOf(val) === index);
        return undefined;
    },
    stripHandlebarsAroundKey: function(text, key) {
      const LEADING_HANDLEBARS = "{{";
      const TRAILING_HANDLEBARS = "}}";
      let parts = text.split(key);
      return parts.map(part => {
        let i = part.indexOf(TRAILING_HANDLEBARS);
        if(i > -1) part = `${part.slice(0, i)}${part.slice(i+2)}`;
        let j = part.lastIndexOf(LEADING_HANDLEBARS);
        if(j > -1) part = `${part.slice(0, j)}${part.slice(j+2)}`;
        return part;
      });
    },
    sortAsDates: function(array){
      return array.sort((a, b) => new Date(a) - new Date(b));
    },
  }
}
