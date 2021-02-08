let varsRegex = /{{[a-z][a-z0-9]+(\.?[a-z][a-z0-9]+){0,}}}/gi;

export default extractTemplateVariables = (templateString) => {
    let vars = templateString.replaceAll(/\s/, '').match(varsRegex);
    if(vars) return vars.sort().map(v => v.replaceAll('{', '').replaceAll('}', ''));
    return undefined;
};