let config = {
    easy: {
        row: 10,
        col: 10,
        mineNum: 10,
        total: 100,
        curNum: 100
    },
    normal: {
        row: 15,
        col: 15,
        mineNum: 30,
        total: 225,
        curNum: 225
    },
    hard: {
        row: 16,
        col: 30,
        mineNum: 99,
        total: 400,
        curNum: 400
    },
};

let dx = [-1, -1, -1,  0, 0,  1, 1, 1];
let dy = [-1,  0,  1, -1, 1, -1, 0, 1];

let color = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"]
let curLevel = config.easy;
