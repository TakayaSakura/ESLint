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
    function changeStrToDigit(regexStr) {
      const keys = [
        /a/g,
        /b/g,
        /c/g,
        /d/g,
        /e/g,
        /f/g,
        /g/g,
        /h/g,
        /i/g,
        /j/g,
        /k/g,
        /l/g,
        /m/g,
        /n/g,
        /o/g,
        /p/g,
        /q/g,
        /r/g,
        /s/g,
        /t/g,
        /u/g,
        /v/g,
        /w/g,
        /x/g,
        /y/g,
        /z/g,
      ];
      const digits = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
      ];
      for (let i = 0; i < keys.length; i++) {
        regexStr = regexStr.replace(keys[i], digits[i]);
      }
      return regexStr;
    }
    function removeLastDigit(regexStr) {
      let count = 0;

      for (let i = regexStr.length - 2; i >= 0; i--) {
        if (/\d/.test(regexStr[i])) {
          count++;
        } else {
          break;
        }
      }
      // console.log(regexStr.slice(0, -count - 1) + "/");
      return regexStr.slice(0, -count - 1) + "/";
    }
    function removeFirstDigit(regexStr) {
      let count = 0;
      // console.log(regexStr);

      for (let i = 1; i < regexStr.length; i++) {
        if (/\d/.test(regexStr[i])) {
          // console.log(regexStr[i]);
          count++;
          // console.log(count);
        } else {
          break;
        }
      }
      console.log("/" + regexStr.slice(count + 1));
      return "/" + regexStr.slice(count + 1);
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

      // Disjunctionの処理
      function Disjunction(Node) {
        if (
          //左右に"*"がかかっている場合
          Node.left.type === "Repetition" &&
          Node.right.type === "Repetition"
        ) {
          if (
            //左右が同値の場合（課題あり　検知できていない1*1*1、1*1*2）
            Node.left.expression.value === Node.right.expression.value
          ) {
            automatonArray.push(
              [0, Number(Node.left.expression.value)],
              [0, Number(Node.right.expression.value) + 1000000],
              [
                Number(Node.left.expression.value),
                Number(Node.left.expression.value),
              ],
              [
                Number(Node.right.expression.value) + 1000000,
                Number(Node.right.expression.value) + 1000000,
              ],
              [
                Number(Node.left.expression.value),
                Number(Node.right.expression.value) + 1000000,
              ],
              [
                Number(Node.right.expression.value) + 1000000,
                Number(Node.left.expression.value),
              ]
            );
          } else {
            //左右が同値でない場合
            automatonArray.push(
              [0, Number(Node.left.expression.value)],
              [0, Number(Node.right.expression.value)],
              [
                Number(Node.left.expression.value),
                Number(Node.left.expression.value),
              ],
              [
                Number(Node.right.expression.value),
                Number(Node.right.expression.value),
              ]
            );
            // console.log("right");
          }
        } else if (Node.left.type === "Repetition") {
          //左に"*"がかかっている場合
          if (
            //左右が同値の場合
            Node.left.expression.value === Node.right.value
          ) {
            automatonArray.push(
              [0, Number(Node.left.expression.value)],
              [0, Number(Node.right.value) + 1000000],
              [
                Number(Node.left.expression.value),
                Number(Node.left.expression.value),
              ]
            );
            // console.log("right");
          } else {
            //左右が同値でない場合
            automatonArray.push(
              [0, Number(Node.left.expression.value)],
              [0, Number(Node.right.value)],
              [
                Number(Node.left.expression.value),
                Number(Node.left.expression.value),
              ]
            );
          }
        } else if (Node.right.type === "Repetition") {
          //右に"*"がかかっている場合
          if (
            //左右が同値の場合
            Node.left.value === Node.right.expression.value
          ) {
            automatonArray.push(
              [0, Number(Node.left.value)],
              [0, Number(Node.right.expression.value) + 1000000],
              [
                Number(Node.right.expression.value) + 1000000,
                Number(Node.right.expression.value) + 1000000,
              ]
            );
          } else {
            //左右が同値でない場合
            automatonArray.push(
              [0, Number(Node.left.value)],
              [0, Number(Node.right.expression.value)],
              [
                Number(Node.right.expression.value),
                Number(Node.right.expression.value),
              ]
            );
          }
        } else {
          //ノーマルの場合
          if (Node.left.value === Node.right.value) {
            //左右が同値の場合
            automatonArray.push(
              [0, Number(Node.left.value)],
              [0, Number(Node.right.value) + 1000000]
            );
          } else {
            //左右が同値でない場合
            automatonArray.push(
              [0, Number(Node.left.value)],
              [0, Number(Node.right.value)]
            );
          }
        }
        console.log(automatonArray);
      }

      function Repetition(Node) {
        if (
          //これ以降のDisjunctionの確認方法はGroupになってる
          Node.expression.type === "Group" &&
          Node.expression.expression.type === "Repetition"
        ) {
          //"*"がネストしている場合
          let Node2 = Node.expression.expression;
          automatonArray.push(
            [0, Number(Node2.expression.value)],
            [0, Number(Node2.expression.value) + 1000000],
            [Number(Node2.expression.value), Number(Node2.expression.value)],
            [
              Number(Node2.expression.value) + 1000000,
              Number(Node2.expression.value) + 1000000,
            ],
            [
              Number(Node2.expression.value),
              Number(Node2.expression.value) + 1000000,
            ],
            [
              Number(Node2.expression.value) + 1000000,
              Number(Node2.expression.value),
            ]
          );
          console.log(automatonArray);
        } else if (
          //"*"が"|"にかかっているかつ中身の左右が同値の場合
          Node.expression.type === "Group" &&
          Node.expression.expression.left.value ===
            Node.expression.expression.right.value
        ) {
          automatonArray.push(
            [0, Number(Node.expression.expression.left.value)],
            [0, Number(Node.expression.expression.right.value) + 1000000],
            [
              Number(Node.expression.expression.left.value),
              Number(Node.expression.expression.left.value),
            ],
            [
              Number(Node.expression.expression.right.value) + 1000000,
              Number(Node.expression.expression.right.value) + 1000000,
            ],
            [
              Number(Node.expression.expression.left.value),
              Number(Node.expression.expression.right.value) + 1000000,
            ],
            [
              Number(Node.expression.expression.right.value) + 1000000,
              Number(Node.expression.expression.left.value),
            ]
          );
        } else if (Node.expression.type === "Group") {
          //"*"が"|"にかかっている場合
          automatonArray.push(
            [0, Number(Node.expression.expression.left.value)],
            [0, Number(Node.expression.expression.right.value)],
            [
              Number(Node.expression.expression.left.value),
              Number(Node.expression.expression.left.value),
            ],
            [
              Number(Node.expression.expression.right.value),
              Number(Node.expression.expression.right.value),
            ]
          );
        } else {
          //"*"単体の場合
          automatonArray.push(
            [0, Number(Node.expression.value)],
            [Number(Node.expression.value), Number(Node.expression.value)]
          );
        }
        console.log(automatonArray);
      }

      traverse(ast, {
        Disjunction(path) {
          // console.log("Found Disjunction");
          if (!foundDisjunction && !foundRepetition) {
            foundDisjunction = true;
            disjunctionNode = path.node;
            Disjunction(disjunctionNode);
          }
        },
        Repetition(path) {
          // console.log("Found Repetition");
          if (!foundRepetition && !foundDisjunction) {
            foundRepetition = true;
            repetitionNode = path.node;
            Repetition(repetitionNode);
          }
        },
      });

      return automatonArray.length >= 4;
    }

    return {
      Literal(node) {
        if (node.value instanceof RegExp) {
          const afterDigit = changeStrToDigit(node.value.toString());
          const noLastDigit = removeLastDigit(afterDigit);
          const regexStr = removeFirstDigit(noLastDigit);
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
          const regexStr1 = removeLastDigit(node.arguments[0].value);
          const regexStr = removeFirstDigit(regexStr1);
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
    };
  },
};
