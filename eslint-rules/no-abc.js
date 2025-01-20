export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow 'abc' string in code",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === "string" && node.value.includes("abc")) {
          context.report({
            node: node,
            message: "The string 'abc' is not allowed",
          });
        }
      },
      TemplateElement(node) {
        if (node.value.raw.includes("abc")) {
          context.report({
            node: node,
            message: "The string 'abc' is not allowed in template literals",
          });
        }
      },
    };
  },
};
