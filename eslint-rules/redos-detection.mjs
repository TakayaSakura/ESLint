import pkg from "regexp-tree";
const { parse, traverse } = pkg;

export default {
  meta: {
    type: "problem",
    docs: {
      description: "",
      category: "",
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    function removeLastDigit(regexStr) {
      const lastChar = regexStr[regexStr.length - 1];
      if (/\d/.test(lastChar)) {
        return regexStr.slice(0, -1);
      }
      return regexStr;
    }

    function checkIDA(ast) {
      let found = false;
      traverse(ast, {
        Alternative(path) {
          const expressions = path.node.expressions;
          if (expressions.length === 2) {
            const firstRepetition = expressions[0];
            const secondRepetition = expressions[1];
            if (
              firstRepetition.type === "Repetition" &&
              secondRepetition.type === "Repetition" &&
              firstRepetition.expression.value ===
                secondRepetition.expression.value
            ) {
              found = true;
            }
          }
        },
      });
      return found;
    }

    function checkEDA(ast) {
      let automatonArray = [];
      let foundDisjunction = false;
      let foundRepetition = false;
      let disjunctionNode = null;
      let repetitionNode = null;
      let node2 = null;

      // Disjunctionの処理
      function processDisjunction(node) {
        if (
          node.left.type === "Repetition" &&
          node.right.type === "Repetition"
        ) {
          if (node.left.expression.value === node.right.expression.value) {
            automatonArray.push(
              [0, Number(node.left.expression.value)],
              [0, Number(node.right.expression.value) + 100],
              [
                Number(node.left.expression.value),
                Number(node.left.expression.value),
              ],
              [
                Number(node.right.expression.value) + 100,
                Number(node.right.expression.value) + 100,
              ],
              [
                Number(node.left.expression.value),
                Number(node.right.expression.value) + 100,
              ],
              [
                Number(node.right.expression.value) + 100,
                Number(node.left.expression.value),
              ]
            );
          } else {
            automatonArray.push(
              [0, Number(node.left.expression.value)],
              [0, Number(node.right.expression.value)],
              [
                Number(node.left.expression.value),
                Number(node.left.expression.value),
              ],
              [
                Number(node.right.expression.value),
                Number(node.right.expression.value),
              ]
            );
          }
        }
      }

      // Repetitionの処理
      function processRepetition(node) {
        if (
          node.expression.type === "Group" &&
          node.expression.expression.type === "Repetition"
        ) {
          node2 = node.expression.expression;
        }

        if (node2) {
          automatonArray.push(
            [0, Number(node2.expression.value)],
            [0, Number(node2.expression.value) + 100],
            [Number(node2.expression.value), Number(node2.expression.value)],
            [
              Number(node2.expression.value) + 100,
              Number(node2.expression.value) + 100,
            ],
            [
              Number(node2.expression.value),
              Number(node2.expression.value) + 100,
            ],
            [
              Number(node2.expression.value) + 100,
              Number(node2.expression.value),
            ]
          );
        }
      }

      traverse(ast, {
        Disjunction(path) {
          if (!foundDisjunction && !foundRepetition) {
            foundDisjunction = true;
            disjunctionNode = path.node;
            processDisjunction(disjunctionNode);
          }
        },
        Repetition(path) {
          if (!foundRepetition && !foundDisjunction) {
            foundRepetition = true;
            repetitionNode = path.node;
            processRepetition(repetitionNode);
          }
        },
      });

      return automatonArray.length >= 4;
    }

    return {
      Literal(node) {
        if (node.value instanceof RegExp) {
          const regexStr = removeLastDigit(node.value.toString());
          try {
            const ast = parse(regexStr);
            const hasIDA = checkIDA(ast);
            const hasEDA = checkEDA(ast);

            if (hasIDA || hasEDA) {
              context.report({
                node,
                message: "might cause ReDoS",
              });
            }
          } catch (error) {}
        }
      },
      NewExpression(node) {
        if (node.callee.name === "RegExp" && node.arguments.length > 0) {
          const regexStr = removeLastDigit(node.arguments[0].value);
          try {
            const ast = parse(regexStr);
            const hasIDA = checkIDA(ast);
            const hasEDA = checkEDA(ast);

            if (hasIDA || hasEDA) {
              context.report({
                node,
                message: "might cause ReDoS",
              });
            }
          } catch (error) {
            // 正規表現のパースエラーは無視
          }
        }
      },
    };
  },
};
