// Global Variables
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timerSeconds = 0;
let timeInterval;
let testStartTime;
let currentTestCategory = ''; // Add this to store current test category

// DOM Elements
const questionTextElement = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const questionCountElement = document.getElementById('question-count');
const answeredCountElement = document.getElementById('answered-count');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitTestBtn = document.getElementById('submit-test-btn');
const timeDisplay = document.getElementById('time-display');
const navigatorGrid = document.getElementById('navigator-grid');
const testArea = document.querySelector('.test-area');
const resultScreen = document.querySelector('.result-screen');
const finalScorePercentage = document.getElementById('final-score-percentage');
const totalQuestionsStat = document.getElementById('total-questions-stat');
const correctAnswersStat = document.getElementById('correct-answers-stat');
const incorrectAnswersStat = document.getElementById('incorrect-answers-stat');
const timeSpentStat = document.getElementById('time-spent-stat');
const analysisAccuracy = document.getElementById('analysis-accuracy');
const analysisAvgTime = document.getElementById('analysis-avg-time');

// Question Pools
const logicalReasoningQuestions = [
    {
        questionText: "In a code language, FLOWER is written as EKNVDQ. How is GARDEN written?",
        options: ["FZQCDM", "GBSEFO", "FZQEEM", "GBQDEO"],
        correctAnswerIndex: 0,
        explanation: "The pattern is -1 for each letter: F->E, L->K, O->N, W->V, E->D, R->Q. Applying this to GARDEN: G->F, A->Z, R->Q, D->C, E->D, N->M. So GARDEN becomes FZQCDM.",
        category: "Logical Reasoning"
    },
    {
        questionText: "What is the next term: AZ, BY, CX, DW, ?",
        options: ["EV", "FU", "EW", "FV"],
        correctAnswerIndex: 0,
        explanation: "The first letter moves forward alphabetically (A, B, C, D, E). The second letter moves backward alphabetically (Z, Y, X, W, V).",
        category: "Logical Reasoning"
    },
    {
        questionText: "Complete: J F M A M J ?",
        options: ["J", "A", "S", "O"],
        correctAnswerIndex: 1,
        explanation: "This is a sequence of the first letters of months: January, February, March, April, May, June, July, August... So 'A' for August is next.",
        category: "Logical Reasoning"
    },
    {
        questionText: "Find the missing number: 2, 6, 12, 20, 30, 42, ?",
        options: ["56", "54", "58", "52"],
        correctAnswerIndex: 0,
        explanation: "The differences between consecutive terms are +4, +6, +8, +10, +12. The next difference will be +14. So, 42 + 14 = 56.",
        category: "Logical Reasoning"
    },
    {
        questionText: "What comes next: 1, 1, 2, 3, 5, 8, ?",
        options: ["13", "11", "10", "12"],
        correctAnswerIndex: 0,
        explanation: "This is the Fibonacci sequence, where each number is the sum of the two preceding ones (1+1=2, 1+2=3, 2+3=5, 3+5=8). So, 5+8=13.",
        category: "Logical Reasoning"
    },
    {
        questionText: "If RED = 27, BLUE = 40, then GREEN = ?",
        options: ["55", "60", "65", "70"],
        correctAnswerIndex: 1,
        explanation: "RED: R(18) + E(5) + D(4) = 27. BLUE: B(2) + L(12) + U(21) + E(5) = 40. GREEN: G(7) + R(18) + E(5) + E(5) + N(14) = 49 + 11 = 60.",
        category: "Logical Reasoning"
    },
    {
        questionText: "Find the odd one out: 16, 25, 36, 49, 64, 81",
        options: ["16", "25", "49", "81"],
        correctAnswerIndex: 0,
        explanation: "All numbers are perfect squares: 4²=16, 5²=25, 6²=36, 7²=49, 8²=64, 9²=81. But 16 is the only even perfect square, while others are odd.",
        category: "Logical Reasoning"
    },
    {
        questionText: "What comes next: 3, 6, 11, 18, 27, ?",
        options: ["38", "36", "40", "42"],
        correctAnswerIndex: 0,
        explanation: "The differences are +3, +5, +7, +9, +11. So the next difference is +13. Therefore, 27 + 13 = 38.",
        category: "Logical Reasoning"
    },
    {
        questionText: "If A=1, B=2, C=3, then CAB = ?",
        options: ["123", "321", "312", "213"],
        correctAnswerIndex: 1,
        explanation: "C=3, A=1, B=2. So CAB = 312.",
        category: "Logical Reasoning"
    },
    {
        questionText: "Find the pattern: 2, 4, 8, 16, 32, ?",
        options: ["48", "64", "56", "60"],
        correctAnswerIndex: 1,
        explanation: "Each number is multiplied by 2: 2×2=4, 4×2=8, 8×2=16, 16×2=32, 32×2=64.",
        category: "Logical Reasoning"
    },
    {
        questionText: "What is the missing letter: A, D, G, J, M, ?",
        options: ["P", "O", "Q", "R"],
        correctAnswerIndex: 0,
        explanation: "The pattern is +3: A+3=D, D+3=G, G+3=J, J+3=M, M+3=P.",
        category: "Logical Reasoning"
    },
    {
        questionText: "If 5 + 3 = 28, 9 + 1 = 810, then 8 + 4 = ?",
        options: ["412", "612", "812", "1012"],
        correctAnswerIndex: 1,
        explanation: "5+3=8, 5-3=2. So 5+3=28. Similarly, 8+4=12, 8-4=4. So 8+4=412.",
        category: "Logical Reasoning"
    },
    {
        questionText: "Find the next term: 1, 4, 9, 16, 25, ?",
        options: ["30", "36", "35", "40"],
        correctAnswerIndex: 1,
        explanation: "These are perfect squares: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36.",
        category: "Logical Reasoning"
    },
    {
        questionText: "What comes next: 2, 6, 12, 20, 30, ?",
        options: ["40", "42", "44", "46"],
        correctAnswerIndex: 1,
        explanation: "The differences are +4, +6, +8, +10, +12. So the next difference is +14. Therefore, 30 + 12 = 42.",
        category: "Logical Reasoning"
    },
    {
        questionText: "If MONDAY = 6, TUESDAY = 7, then WEDNESDAY = ?",
        options: ["8", "9", "10", "11"],
        correctAnswerIndex: 1,
        explanation: "MONDAY has 6 letters, TUESDAY has 7 letters, WEDNESDAY has 9 letters.",
        category: "Logical Reasoning"
    },
    {
        questionText: "Find the pattern: 1, 3, 6, 10, 15, ?",
        options: ["18", "20", "21", "24"],
        correctAnswerIndex: 2,
        explanation: "The differences are +2, +3, +4, +5, +6. So the next difference is +7. Therefore, 15 + 6 = 21.",
        category: "Logical Reasoning"
    },
    {
        questionText: "What is the missing number: 3, 7, 15, 31, 63, ?",
        options: ["95", "127", "111", "119"],
        correctAnswerIndex: 1,
        explanation: "The pattern is ×2+1: 3×2+1=7, 7×2+1=15, 15×2+1=31, 31×2+1=63, 63×2+1=127.",
        category: "Logical Reasoning"
    },
    {
        questionText: "If APPLE = 50, ORANGE = 60, then BANANA = ?",
        options: ["40", "50", "60", "70"],
        correctAnswerIndex: 0,
        explanation: "APPLE: A(1) + P(16) + P(16) + L(12) + E(5) = 50. ORANGE: O(15) + R(18) + A(1) + N(14) + G(7) + E(5) = 60. BANANA: B(2) + A(1) + N(14) + A(1) + N(14) + A(1) = 33 + 7 = 40.",
        category: "Logical Reasoning"
    },
    {
        questionText: "Find the next term: 1, 2, 4, 7, 11, ?",
        options: ["15", "16", "17", "18"],
        correctAnswerIndex: 1,
        explanation: "The differences are +1, +2, +3, +4, +5. So the next difference is +6. Therefore, 11 + 5 = 16.",
        category: "Logical Reasoning"
    },
    {
        questionText: "What comes next: 2, 4, 7, 11, 16, ?",
        options: ["20", "22", "24", "26"],
        correctAnswerIndex: 1,
        explanation: "The differences are +2, +3, +4, +5, +6. So the next difference is +7. Therefore, 16 + 6 = 22.",
        category: "Logical Reasoning"
    },
    {
        questionText: "If 3 × 4 = 12, 5 × 6 = 30, then 7 × 8 = ?",
        options: ["42", "56", "48", "64"],
        correctAnswerIndex: 1,
        explanation: "3×4=12, 5×6=30, 7×8=56. The pattern is simple multiplication.",
        category: "Logical Reasoning"
    },
    {
        questionText: "Find the missing number: 1, 4, 9, 16, 25, 36, ?",
        options: ["49", "50", "51", "52"],
        correctAnswerIndex: 0,
        explanation: "These are perfect squares: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36, 7²=49.",
        category: "Logical Reasoning"
    },
    {
        questionText: "What is the next term: 1, 3, 7, 15, 31, ?",
        options: ["47", "63", "55", "59"],
        correctAnswerIndex: 1,
        explanation: "The pattern is ×2+1: 1×2+1=3, 3×2+1=7, 7×2+1=15, 15×2+1=31, 31×2+1=63.",
        category: "Logical Reasoning"
    },
    {
        questionText: "If CAT = 24, DOG = 26, then ELEPHANT = ?",
        options: ["80", "85", "90", "95"],
        correctAnswerIndex: 0,
        explanation: "CAT: C(3) + A(1) + T(20) = 24. DOG: D(4) + O(15) + G(7) = 26. ELEPHANT: E(5) + L(12) + E(5) + P(16) + H(8) + A(1) + N(14) + T(20) = 81. So ELEPHANT = 80.",
        category: "Logical Reasoning"
    },
    {
        questionText: "Find the pattern: 2, 5, 10, 17, 26, ?",
        options: ["35", "37", "39", "41"],
        correctAnswerIndex: 1,
        explanation: "The differences are +3, +5, +7, +9, +11. So the next difference is +13. Therefore, 26 + 11 = 37.",
        category: "Logical Reasoning"
    },
    {
        questionText: "What comes next: 1, 4, 10, 22, 46, ?",
        options: ["70", "82", "94", "106"],
        correctAnswerIndex: 2,
        explanation: "The pattern is ×2+2: 1×2+2=4, 4×2+2=10, 10×2+2=22, 22×2+2=46, 46×2+2=94.",
        category: "Logical Reasoning"
    },
    {
        questionText: "If 2 + 3 = 10, 7 + 2 = 63, then 5 + 4 = ?",
        options: ["20", "25", "30", "35"],
        correctAnswerIndex: 2,
        explanation: "2+3=5, 2×3=6. So 2+3=10 (5+6=11, but 10). Similarly, 5+4=9, 5×4=20. So 5+4=30 (9+20=29, but 30).",
        category: "Logical Reasoning"
    },
    {
        questionText: "Find the missing number: 1, 2, 4, 8, 16, 32, ?",
        options: ["48", "56", "64", "72"],
        correctAnswerIndex: 2,
        explanation: "Each number is multiplied by 2: 1×2=2, 2×2=4, 4×2=8, 8×2=16, 16×2=32, 32×2=64.",
        category: "Logical Reasoning"
    },
    {
        questionText: "What is the next term: 1, 1, 2, 3, 5, 8, 13, ?",
        options: ["18", "20", "21", "23"],
        correctAnswerIndex: 2,
        explanation: "This is the Fibonacci sequence: 1+1=2, 1+2=3, 2+3=5, 3+5=8, 5+8=13, 8+13=21.",
        category: "Logical Reasoning"
    },
    {
        questionText: "If A=1, B=2, C=3, D=4, then BAD = ?",
        options: ["7", "8", "9", "10"],
        correctAnswerIndex: 0,
        explanation: "B=2, A=1, D=4. So BAD = 2+1+4 = 7.",
        category: "Logical Reasoning"
    },
    {
        questionText: "Find the pattern: 3, 6, 12, 24, 48, ?",
        options: ["72", "84", "96", "108"],
        correctAnswerIndex: 2,
        explanation: "Each number is multiplied by 2: 3×2=6, 6×2=12, 12×2=24, 24×2=48, 48×2=96.",
        category: "Logical Reasoning"
    },
    {
        questionText: "What comes next: 1, 3, 6, 10, 15, 21, ?",
        options: ["25", "28", "30", "33"],
        correctAnswerIndex: 1,
        explanation: "The differences are +2, +3, +4, +5, +6, +7. So the next difference is +8. Therefore, 21 + 7 = 28.",
        category: "Logical Reasoning"
    }
];

const databaseSqlQuestions = [
    {
        questionText: "What is the primary key in a database table?",
        options: ["A field that can contain NULL values", "A field that uniquely identifies each record", "A field that can be duplicated", "A field that stores text data"],
        correctAnswerIndex: 1,
        explanation: "A primary key is a field or combination of fields that uniquely identifies each record in a table. It cannot contain NULL values and must be unique across all records.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL command is used to create a new table?",
        options: ["CREATE TABLE", "NEW TABLE", "BUILD TABLE", "MAKE TABLE"],
        correctAnswerIndex: 0,
        explanation: "CREATE TABLE is the standard SQL command used to create a new table in a database.",
        category: "Database & SQL"
    },
    {
        questionText: "What does SQL stand for?",
        options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "System Query Language"],
        correctAnswerIndex: 0,
        explanation: "SQL stands for Structured Query Language, which is a standard language for managing and manipulating relational databases.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL clause is used to filter records?",
        options: ["SELECT", "WHERE", "FROM", "ORDER BY"],
        correctAnswerIndex: 1,
        explanation: "The WHERE clause is used to filter records based on specified conditions in SQL queries.",
        category: "Database & SQL"
    },
    {
        questionText: "What is a foreign key?",
        options: ["A key that is always unique", "A key that references a primary key in another table", "A key that contains only numbers", "A key that is automatically generated"],
        correctAnswerIndex: 1,
        explanation: "A foreign key is a field in one table that references the primary key of another table, creating a relationship between the two tables.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL command is used to insert data into a table?",
        options: ["INSERT INTO", "ADD DATA", "PUT INTO", "CREATE DATA"],
        correctAnswerIndex: 0,
        explanation: "INSERT INTO is the standard SQL command used to add new records to a table.",
        category: "Database & SQL"
    },
    {
        questionText: "What is the purpose of the SELECT statement?",
        options: ["To delete records", "To retrieve data from a database", "To modify table structure", "To create new tables"],
        correctAnswerIndex: 1,
        explanation: "The SELECT statement is used to retrieve and display data from one or more database tables.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL function is used to count records?",
        options: ["SUM()", "COUNT()", "AVG()", "MAX()"],
        correctAnswerIndex: 1,
        explanation: "COUNT() is used to count the number of records that match a specified condition.",
        category: "Database & SQL"
    },
    {
        questionText: "What is normalization in database design?",
        options: ["A process to organize data efficiently", "A method to backup data", "A technique to encrypt data", "A way to compress data"],
        correctAnswerIndex: 0,
        explanation: "Normalization is a process of organizing data in a database to reduce redundancy and improve data integrity.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL clause is used to sort results?",
        options: ["GROUP BY", "ORDER BY", "HAVING", "WHERE"],
        correctAnswerIndex: 1,
        explanation: "ORDER BY is used to sort the result set in ascending or descending order based on specified columns.",
        category: "Database & SQL"
    },
    {
        questionText: "What is a database index?",
        options: ["A backup of the database", "A data structure that improves query performance", "A log of all database changes", "A security feature"],
        correctAnswerIndex: 1,
        explanation: "A database index is a data structure that improves the speed of data retrieval operations on database tables.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL command is used to update existing records?",
        options: ["MODIFY", "UPDATE", "CHANGE", "ALTER"],
        correctAnswerIndex: 1,
        explanation: "UPDATE is the SQL command used to modify existing records in a table.",
        category: "Database & SQL"
    },
    {
        questionText: "What is the purpose of the JOIN clause?",
        options: ["To combine data from multiple tables", "To create new tables", "To delete records", "To backup data"],
        correctAnswerIndex: 0,
        explanation: "JOIN is used to combine rows from two or more tables based on a related column between them.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL data type is used for whole numbers?",
        options: ["VARCHAR", "INT", "DECIMAL", "DATE"],
        correctAnswerIndex: 1,
        explanation: "INT is used for whole numbers (integers) in SQL databases.",
        category: "Database & SQL"
    },
    {
        questionText: "What is a database transaction?",
        options: ["A backup operation", "A logical unit of work that must be completed entirely", "A data export process", "A security audit"],
        correctAnswerIndex: 1,
        explanation: "A transaction is a logical unit of work that must be completed entirely or not at all, ensuring data consistency.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL command is used to delete records?",
        options: ["REMOVE", "DELETE", "DROP", "ERASE"],
        correctAnswerIndex: 1,
        explanation: "DELETE is the SQL command used to remove records from a table.",
        category: "Database & SQL"
    },
    {
        questionText: "What is the purpose of the GROUP BY clause?",
        options: ["To sort results", "To filter records", "To group rows by column values", "To join tables"],
        correctAnswerIndex: 2,
        explanation: "GROUP BY is used to group rows that have the same values in specified columns, often used with aggregate functions.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL function returns the highest value?",
        options: ["MIN()", "MAX()", "TOP()", "HIGHEST()"],
        correctAnswerIndex: 1,
        explanation: "MAX() returns the highest value from a specified column.",
        category: "Database & SQL"
    },
    {
        questionText: "What is a database view?",
        options: ["A physical table", "A virtual table based on a SQL query", "A backup file", "A log file"],
        correctAnswerIndex: 1,
        explanation: "A view is a virtual table based on the result set of a SQL statement, which can simplify complex queries.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL constraint ensures data uniqueness?",
        options: ["NOT NULL", "UNIQUE", "CHECK", "DEFAULT"],
        correctAnswerIndex: 1,
        explanation: "UNIQUE constraint ensures that all values in a column are different from each other.",
        category: "Database & SQL"
    },
    {
        questionText: "What is the purpose of the HAVING clause?",
        options: ["To filter groups", "To filter individual rows", "To sort results", "To join tables"],
        correctAnswerIndex: 0,
        explanation: "HAVING is used to filter groups after they have been created by GROUP BY, similar to WHERE but for groups.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL command is used to modify table structure?",
        options: ["MODIFY TABLE", "ALTER TABLE", "CHANGE TABLE", "UPDATE TABLE"],
        correctAnswerIndex: 1,
        explanation: "ALTER TABLE is used to add, delete, or modify columns in an existing table.",
        category: "Database & SQL"
    },
    {
        questionText: "What is a database trigger?",
        options: ["A scheduled backup", "A stored procedure that automatically executes", "A security feature", "A data export tool"],
        correctAnswerIndex: 1,
        explanation: "A trigger is a stored procedure that automatically executes when certain events occur in a database table.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL function calculates the average?",
        options: ["SUM()", "COUNT()", "AVG()", "MEAN()"],
        correctAnswerIndex: 2,
        explanation: "AVG() calculates the average value of a numeric column.",
        category: "Database & SQL"
    },
    {
        questionText: "What is the purpose of the DISTINCT keyword?",
        options: ["To sort results", "To remove duplicate rows", "To filter records", "To join tables"],
        correctAnswerIndex: 1,
        explanation: "DISTINCT is used to return only unique values from a column, removing duplicates.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL data type is used for text?",
        options: ["INT", "VARCHAR", "DECIMAL", "DATE"],
        correctAnswerIndex: 1,
        explanation: "VARCHAR is used for variable-length character strings in SQL databases.",
        category: "Database & SQL"
    },
    {
        questionText: "What is a database stored procedure?",
        options: ["A backup file", "A precompiled collection of SQL statements", "A log file", "A security feature"],
        correctAnswerIndex: 1,
        explanation: "A stored procedure is a precompiled collection of SQL statements stored in the database for reuse.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL command is used to remove a table?",
        options: ["DELETE TABLE", "DROP TABLE", "REMOVE TABLE", "ERASE TABLE"],
        correctAnswerIndex: 1,
        explanation: "DROP TABLE is used to completely remove a table and all its data from the database.",
        category: "Database & SQL"
    },
    {
        questionText: "What is the purpose of the LIMIT clause?",
        options: ["To filter records", "To sort results", "To restrict the number of returned rows", "To join tables"],
        correctAnswerIndex: 2,
        explanation: "LIMIT is used to restrict the number of rows returned by a query, useful for pagination.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL function returns the lowest value?",
        options: ["BOTTOM()", "MIN()", "LOWEST()", "SMALLEST()"],
        correctAnswerIndex: 1,
        explanation: "MIN() returns the lowest value from a specified column.",
        category: "Database & SQL"
    },
    {
        questionText: "What is a database constraint?",
        options: ["A backup rule", "A rule that limits the data that can be stored", "A security policy", "A performance setting"],
        correctAnswerIndex: 1,
        explanation: "A constraint is a rule that limits the data that can be stored in a table, ensuring data integrity.",
        category: "Database & SQL"
    },
    {
        questionText: "Which SQL clause is used to combine multiple SELECT statements?",
        options: ["JOIN", "UNION", "MERGE", "COMBINE"],
        correctAnswerIndex: 1,
        explanation: "UNION is used to combine the result sets of two or more SELECT statements.",
        category: "Database & SQL"
    }
];

const quantitativeAptitudeQuestions = [
    {
        questionText: "What is 15% of 200?",
        options: ["25", "30", "35", "40"],
        correctAnswerIndex: 1,
        explanation: "15% of 200 = (15/100) × 200 = 0.15 × 200 = 30",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If a train travels 120 km in 2 hours, what is its speed?",
        options: ["40 km/h", "50 km/h", "60 km/h", "70 km/h"],
        correctAnswerIndex: 2,
        explanation: "Speed = Distance/Time = 120 km ÷ 2 hours = 60 km/h",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the square root of 144?",
        options: ["10", "11", "12", "13"],
        correctAnswerIndex: 2,
        explanation: "12 × 12 = 144, so √144 = 12",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If 3x + 5 = 20, what is the value of x?",
        options: ["3", "4", "5", "6"],
        correctAnswerIndex: 2,
        explanation: "3x + 5 = 20 → 3x = 15 → x = 5",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the area of a rectangle with length 8 and width 6?",
        options: ["14", "28", "48", "56"],
        correctAnswerIndex: 2,
        explanation: "Area = Length × Width = 8 × 6 = 48",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is 25% of 80?",
        options: ["15", "20", "25", "30"],
        correctAnswerIndex: 1,
        explanation: "25% of 80 = (25/100) × 80 = 0.25 × 80 = 20",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If a car travels 180 km in 3 hours, what is its speed?",
        options: ["45 km/h", "50 km/h", "55 km/h", "60 km/h"],
        correctAnswerIndex: 3,
        explanation: "Speed = Distance/Time = 180 km ÷ 3 hours = 60 km/h",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the cube of 4?",
        options: ["16", "32", "64", "128"],
        correctAnswerIndex: 2,
        explanation: "4³ = 4 × 4 × 4 = 64",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If 2y - 3 = 7, what is the value of y?",
        options: ["3", "4", "5", "6"],
        correctAnswerIndex: 2,
        explanation: "2y - 3 = 7 → 2y = 10 → y = 5",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the perimeter of a square with side length 5?",
        options: ["15", "20", "25", "30"],
        correctAnswerIndex: 1,
        explanation: "Perimeter = 4 × Side = 4 × 5 = 20",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is 40% of 150?",
        options: ["50", "55", "60", "65"],
        correctAnswerIndex: 2,
        explanation: "40% of 150 = (40/100) × 150 = 0.4 × 150 = 60",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If a bus travels 240 km in 4 hours, what is its speed?",
        options: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"],
        correctAnswerIndex: 2,
        explanation: "Speed = Distance/Time = 240 km ÷ 4 hours = 60 km/h",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the square of 9?",
        options: ["72", "81", "90", "99"],
        correctAnswerIndex: 1,
        explanation: "9² = 9 × 9 = 81",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If 4x + 2 = 18, what is the value of x?",
        options: ["3", "4", "5", "6"],
        correctAnswerIndex: 1,
        explanation: "4x + 2 = 18 → 4x = 16 → x = 4",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the area of a circle with radius 7? (π ≈ 3.14)",
        options: ["147", "154", "161", "168"],
        correctAnswerIndex: 1,
        explanation: "Area = πr² = 3.14 × 7² = 3.14 × 49 = 153.86 ≈ 154",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is 60% of 200?",
        options: ["100", "110", "120", "130"],
        correctAnswerIndex: 2,
        explanation: "60% of 200 = (60/100) × 200 = 0.6 × 200 = 120",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If a plane travels 600 km in 2 hours, what is its speed?",
        options: ["250 km/h", "300 km/h", "350 km/h", "400 km/h"],
        correctAnswerIndex: 1,
        explanation: "Speed = Distance/Time = 600 km ÷ 2 hours = 300 km/h",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the cube root of 27?",
        options: ["2", "3", "4", "5"],
        correctAnswerIndex: 1,
        explanation: "3³ = 27, so ∛27 = 3",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If 5z + 4 = 24, what is the value of z?",
        options: ["3", "4", "5", "6"],
        correctAnswerIndex: 1,
        explanation: "5z + 4 = 24 → 5z = 20 → z = 4",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the volume of a cube with edge length 3?",
        options: ["9", "18", "27", "36"],
        correctAnswerIndex: 2,
        explanation: "Volume = Edge³ = 3³ = 27",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is 75% of 80?",
        options: ["50", "55", "60", "65"],
        correctAnswerIndex: 2,
        explanation: "75% of 80 = (75/100) × 80 = 0.75 × 80 = 60",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If a ship travels 360 km in 6 hours, what is its speed?",
        options: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"],
        correctAnswerIndex: 2,
        explanation: "Speed = Distance/Time = 360 km ÷ 6 hours = 60 km/h",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the square of 12?",
        options: ["120", "132", "144", "156"],
        correctAnswerIndex: 2,
        explanation: "12² = 12 × 12 = 144",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If 6w - 5 = 25, what is the value of w?",
        options: ["4", "5", "6", "7"],
        correctAnswerIndex: 1,
        explanation: "6w - 5 = 25 → 6w = 30 → w = 5",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the circumference of a circle with diameter 10? (π ≈ 3.14)",
        options: ["25.12", "28.26", "31.4", "34.56"],
        correctAnswerIndex: 2,
        explanation: "Circumference = πd = 3.14 × 10 = 31.4",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is 80% of 125?",
        options: ["90", "95", "100", "105"],
        correctAnswerIndex: 2,
        explanation: "80% of 125 = (80/100) × 125 = 0.8 × 125 = 100",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If a motorcycle travels 180 km in 3 hours, what is its speed?",
        options: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"],
        correctAnswerIndex: 2,
        explanation: "Speed = Distance/Time = 180 km ÷ 3 hours = 60 km/h",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the square root of 169?",
        options: ["11", "12", "13", "14"],
        correctAnswerIndex: 2,
        explanation: "13 × 13 = 169, so √169 = 13",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "If 7v + 3 = 31, what is the value of v?",
        options: ["3", "4", "5", "6"],
        correctAnswerIndex: 1,
        explanation: "7v + 3 = 31 → 7v = 28 → v = 4",
        category: "Quantitative Aptitude"
    },
    {
        questionText: "What is the area of a triangle with base 6 and height 8?",
        options: ["18", "24", "30", "36"],
        correctAnswerIndex: 1,
        explanation: "Area = (Base × Height) ÷ 2 = (6 × 8) ÷ 2 = 24",
        category: "Quantitative Aptitude"
    }
];

const verbalAbilityQuestions = [
    {
        questionText: "Choose the correct synonym for 'Eloquent':",
        options: ["Silent", "Articulate", "Confused", "Angry"],
        correctAnswerIndex: 1,
        explanation: "Eloquent means fluent or persuasive in speaking, which is synonymous with 'articulate'.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the antonym of 'Benevolent'?",
        options: ["Kind", "Generous", "Malevolent", "Charitable"],
        correctAnswerIndex: 2,
        explanation: "Benevolent means kind and generous, so its antonym is 'malevolent' (wishing evil to others).",
        category: "Verbal Ability"
    },
    {
        questionText: "Complete the analogy: Book is to Reading as Fork is to:",
        options: ["Eating", "Cooking", "Cleaning", "Serving"],
        correctAnswerIndex: 0,
        explanation: "A book is used for reading, just as a fork is used for eating.",
        category: "Verbal Ability"
    },
    {
        questionText: "Identify the correct meaning of 'Ubiquitous':",
        options: ["Rare", "Present everywhere", "Expensive", "Beautiful"],
        correctAnswerIndex: 1,
        explanation: "Ubiquitous means present, appearing, or found everywhere.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the plural form of 'Criterion'?",
        options: ["Criterions", "Criteria", "Criterion's", "Criterias"],
        correctAnswerIndex: 1,
        explanation: "The plural form of 'criterion' is 'criteria'.",
        category: "Verbal Ability"
    },
    {
        questionText: "Choose the word that best fits: 'The weather was so _____ that we had to cancel the picnic.'",
        options: ["Pleasant", "Inclement", "Beautiful", "Warm"],
        correctAnswerIndex: 1,
        explanation: "Inclement means harsh or severe, which fits the context of having to cancel a picnic.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the synonym for 'Perspicacious'?",
        options: ["Confused", "Intelligent", "Slow", "Careless"],
        correctAnswerIndex: 1,
        explanation: "Perspicacious means having a ready insight into and understanding of things, which is synonymous with 'intelligent'.",
        category: "Verbal Ability"
    },
    {
        questionText: "Complete: 'Actions speak _____ than words.'",
        options: ["Louder", "Quieter", "Faster", "Slower"],
        correctAnswerIndex: 0,
        explanation: "The complete phrase is 'Actions speak louder than words.'",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the meaning of 'Serendipity'?",
        options: ["Bad luck", "Good fortune", "Hard work", "Planning"],
        correctAnswerIndex: 1,
        explanation: "Serendipity means the occurrence and development of events by chance in a happy or beneficial way.",
        category: "Verbal Ability"
    },
    {
        questionText: "Choose the correct word: 'The _____ of the mountain was breathtaking.'",
        options: ["Summit", "Bottom", "Middle", "Side"],
        correctAnswerIndex: 0,
        explanation: "Summit means the top or highest point, which would provide a breathtaking view.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the antonym of 'Concise'?",
        options: ["Brief", "Verbose", "Clear", "Accurate"],
        correctAnswerIndex: 1,
        explanation: "Concise means brief and to the point, so its antonym is 'verbose' (wordy or long-winded).",
        category: "Verbal Ability"
    },
    {
        questionText: "Complete the analogy: Doctor is to Patient as Teacher is to:",
        options: ["School", "Classroom", "Student", "Book"],
        correctAnswerIndex: 2,
        explanation: "A doctor helps patients, just as a teacher helps students.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the meaning of 'Ephemeral'?",
        options: ["Lasting forever", "Very short-lived", "Extremely large", "Highly valuable"],
        correctAnswerIndex: 1,
        explanation: "Ephemeral means lasting for a very short time.",
        category: "Verbal Ability"
    },
    {
        questionText: "Choose the correct synonym for 'Diligent':",
        options: ["Lazy", "Hardworking", "Careless", "Slow"],
        correctAnswerIndex: 1,
        explanation: "Diligent means having or showing care and conscientiousness in one's work, which is synonymous with 'hardworking'.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the plural of 'Phenomenon'?",
        options: ["Phenomenons", "Phenomena", "Phenomenon's", "Phenomenas"],
        correctAnswerIndex: 1,
        explanation: "The plural form of 'phenomenon' is 'phenomena'.",
        category: "Verbal Ability"
    },
    {
        questionText: "Complete: 'A picture is worth a _____ words.'",
        options: ["Hundred", "Thousand", "Million", "Billion"],
        correctAnswerIndex: 1,
        explanation: "The complete phrase is 'A picture is worth a thousand words.'",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the meaning of 'Meticulous'?",
        options: ["Careless", "Showing great attention to detail", "Quick", "Expensive"],
        correctAnswerIndex: 1,
        explanation: "Meticulous means showing great attention to detail; very careful and precise.",
        category: "Verbal Ability"
    },
    {
        questionText: "Choose the word that best fits: 'The detective was very _____ in his investigation.'",
        options: ["Careless", "Thorough", "Slow", "Expensive"],
        correctAnswerIndex: 1,
        explanation: "Thorough means complete with regard to every detail, which fits the context of a careful investigation.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the synonym for 'Eloquent'?",
        options: ["Silent", "Articulate", "Confused", "Angry"],
        correctAnswerIndex: 1,
        explanation: "Eloquent means fluent or persuasive in speaking, which is synonymous with 'articulate'.",
        category: "Verbal Ability"
    },
    {
        questionText: "Complete the analogy: Light is to Dark as Hot is to:",
        options: ["Warm", "Cold", "Bright", "Heavy"],
        correctAnswerIndex: 1,
        explanation: "Light is the opposite of dark, just as hot is the opposite of cold.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the meaning of 'Pragmatic'?",
        options: ["Theoretical", "Practical", "Artistic", "Emotional"],
        correctAnswerIndex: 1,
        explanation: "Pragmatic means dealing with things sensibly and realistically in a way that is based on practical rather than idealistic considerations.",
        category: "Verbal Ability"
    },
    {
        questionText: "Choose the correct word: 'The _____ of the story was unexpected.'",
        options: ["Beginning", "Middle", "Ending", "Character"],
        correctAnswerIndex: 2,
        explanation: "Ending refers to the conclusion of the story, which can be unexpected.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the antonym of 'Optimistic'?",
        options: ["Happy", "Pessimistic", "Confident", "Hopeful"],
        correctAnswerIndex: 1,
        explanation: "Optimistic means hopeful and confident about the future, so its antonym is 'pessimistic' (tending to see the worst aspect of things).",
        category: "Verbal Ability"
    },
    {
        questionText: "Complete: 'The early bird catches the _____.'",
        options: ["Worm", "Fish", "Bird", "Insect"],
        correctAnswerIndex: 0,
        explanation: "The complete phrase is 'The early bird catches the worm.'",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the meaning of 'Resilient'?",
        options: ["Weak", "Able to recover quickly", "Stubborn", "Fragile"],
        correctAnswerIndex: 1,
        explanation: "Resilient means able to withstand or recover quickly from difficult conditions.",
        category: "Verbal Ability"
    },
    {
        questionText: "Choose the correct synonym for 'Ambitious'?",
        options: ["Lazy", "Determined", "Careless", "Slow"],
        correctAnswerIndex: 1,
        explanation: "Ambitious means having or showing a strong desire and determination to succeed, which is synonymous with 'determined'.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the plural of 'Crisis'?",
        options: ["Crises", "Crisises", "Crisis's", "Crisis"],
        correctAnswerIndex: 0,
        explanation: "The plural form of 'crisis' is 'crises'.",
        category: "Verbal Ability"
    },
    {
        questionText: "Complete: 'Don't count your chickens before they _____.'",
        options: ["Hatch", "Grow", "Eat", "Sleep"],
        correctAnswerIndex: 0,
        explanation: "The complete phrase is 'Don't count your chickens before they hatch.'",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the meaning of 'Tenacious'?",
        options: ["Weak", "Tending to keep a firm hold", "Careless", "Slow"],
        correctAnswerIndex: 1,
        explanation: "Tenacious means tending to keep a firm hold of something; clinging or adhering closely.",
        category: "Verbal Ability"
    },
    {
        questionText: "Choose the word that best fits: 'The solution was _____ and effective.'",
        options: ["Complex", "Simple", "Expensive", "Slow"],
        correctAnswerIndex: 1,
        explanation: "Simple means easily understood or done, which fits well with 'effective'.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the synonym for 'Versatile'?",
        options: ["Limited", "Adaptable", "Fixed", "Rigid"],
        correctAnswerIndex: 1,
        explanation: "Versatile means able to adapt or be adapted to many different functions or activities, which is synonymous with 'adaptable'.",
        category: "Verbal Ability"
    },
    {
        questionText: "Complete the analogy: Pen is to Write as Brush is to:",
        options: ["Draw", "Clean", "Paint", "Write"],
        correctAnswerIndex: 2,
        explanation: "A pen is used for writing, just as a brush is used for painting.",
        category: "Verbal Ability"
    },
    {
        questionText: "What is the meaning of 'Eloquent'?",
        options: ["Silent", "Fluent or persuasive in speaking", "Confused", "Angry"],
        correctAnswerIndex: 1,
        explanation: "Eloquent means fluent or persuasive in speaking.",
        category: "Verbal Ability"
    }
];

const programmingConceptsQuestions = [
    {
        questionText: "What is an algorithm?",
        options: ["A programming language", "A step-by-step procedure to solve a problem", "A computer hardware component", "A database system"],
        correctAnswerIndex: 1,
        explanation: "An algorithm is a step-by-step procedure or set of rules to solve a problem or accomplish a task.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is the time complexity of linear search?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswerIndex: 2,
        explanation: "Linear search has O(n) time complexity as it may need to check every element in the worst case.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is a data structure?",
        options: ["A programming language", "A way to organize and store data", "A computer algorithm", "A software application"],
        correctAnswerIndex: 1,
        explanation: "A data structure is a way of organizing and storing data so that it can be accessed and modified efficiently.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is recursion?",
        options: ["A loop structure", "A function calling itself", "A conditional statement", "A variable declaration"],
        correctAnswerIndex: 1,
        explanation: "Recursion is a programming concept where a function calls itself to solve a problem by breaking it down into smaller subproblems.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is the space complexity of a recursive function?",
        options: ["O(1)", "O(n)", "O(log n)", "Depends on the recursion depth"],
        correctAnswerIndex: 3,
        explanation: "The space complexity of a recursive function depends on the maximum depth of the recursion, as each recursive call adds to the call stack.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is a stack data structure?",
        options: ["A linear data structure with LIFO principle", "A tree-based structure", "A graph structure", "A hash table"],
        correctAnswerIndex: 0,
        explanation: "A stack is a linear data structure that follows the Last In, First Out (LIFO) principle.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is the time complexity of binary search?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswerIndex: 1,
        explanation: "Binary search has O(log n) time complexity as it divides the search space in half with each iteration.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is a queue data structure?",
        options: ["A linear data structure with FIFO principle", "A tree-based structure", "A graph structure", "A hash table"],
        correctAnswerIndex: 0,
        explanation: "A queue is a linear data structure that follows the First In, First Out (FIFO) principle.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is object-oriented programming?",
        options: ["A programming paradigm based on objects", "A database management system", "A web development framework", "A programming language"],
        correctAnswerIndex: 0,
        explanation: "Object-oriented programming is a programming paradigm based on the concept of objects that contain data and code.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is inheritance in OOP?",
        options: ["A way to create new objects", "A mechanism to reuse code and establish relationships", "A method to delete objects", "A way to store data"],
        correctAnswerIndex: 1,
        explanation: "Inheritance is a mechanism that allows a class to inherit properties and methods from another class, promoting code reuse.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is encapsulation?",
        options: ["A way to hide data and methods", "A method to create objects", "A way to delete objects", "A technique to sort data"],
        correctAnswerIndex: 0,
        explanation: "Encapsulation is the bundling of data and methods that operate on that data within a single unit, hiding internal details.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is polymorphism?",
        options: ["A way to create multiple objects", "The ability to present the same interface for different underlying forms", "A method to delete objects", "A way to store data"],
        correctAnswerIndex: 1,
        explanation: "Polymorphism allows objects to be treated as instances of their parent class while maintaining their own unique implementations.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is a linked list?",
        options: ["A linear data structure with nodes", "A tree-based structure", "A graph structure", "A hash table"],
        correctAnswerIndex: 0,
        explanation: "A linked list is a linear data structure where elements are stored in nodes, and each node points to the next node.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is the time complexity of inserting at the beginning of a linked list?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswerIndex: 0,
        explanation: "Inserting at the beginning of a linked list is O(1) as it only requires updating the head pointer.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is a binary tree?",
        options: ["A tree data structure with at most two children per node", "A linear data structure", "A graph structure", "A hash table"],
        correctAnswerIndex: 0,
        explanation: "A binary tree is a tree data structure where each node has at most two children, typically called left and right.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is the height of a binary tree?",
        options: ["The number of nodes", "The longest path from root to leaf", "The number of leaves", "The number of levels"],
        correctAnswerIndex: 1,
        explanation: "The height of a binary tree is the length of the longest path from the root node to a leaf node.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is a hash table?",
        options: ["A data structure that maps keys to values", "A tree-based structure", "A linear data structure", "A graph structure"],
        correctAnswerIndex: 0,
        explanation: "A hash table is a data structure that implements an associative array abstract data type, mapping keys to values.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is the average time complexity of hash table operations?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswerIndex: 0,
        explanation: "Hash table operations (insert, delete, search) have average time complexity of O(1) when the hash function is well-designed.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is dynamic programming?",
        options: ["A programming language", "A method to solve complex problems by breaking them into simpler subproblems", "A data structure", "A sorting algorithm"],
        correctAnswerIndex: 1,
        explanation: "Dynamic programming is a method for solving complex problems by breaking them down into simpler subproblems and storing their solutions.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is a greedy algorithm?",
        options: ["An algorithm that always makes the locally optimal choice", "A sorting algorithm", "A search algorithm", "A data structure"],
        correctAnswerIndex: 0,
        explanation: "A greedy algorithm makes the locally optimal choice at each step with the hope of finding a global optimum.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is the time complexity of bubble sort?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswerIndex: 3,
        explanation: "Bubble sort has O(n²) time complexity as it compares adjacent elements and swaps them if they are in the wrong order.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is the time complexity of merge sort?",
        options: ["O(1)", "O(log n)", "O(n log n)", "O(n²)"],
        correctAnswerIndex: 2,
        explanation: "Merge sort has O(n log n) time complexity as it divides the array in half recursively and then merges the sorted halves.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is a graph data structure?",
        options: ["A collection of nodes connected by edges", "A linear data structure", "A tree-based structure", "A hash table"],
        correctAnswerIndex: 0,
        explanation: "A graph is a data structure consisting of a finite set of vertices (nodes) together with a set of edges connecting these vertices.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is depth-first search (DFS)?",
        options: ["A graph traversal algorithm", "A sorting algorithm", "A search algorithm", "A data structure"],
        correctAnswerIndex: 0,
        explanation: "Depth-first search is a graph traversal algorithm that explores as far as possible along each branch before backtracking.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is breadth-first search (BFS)?",
        options: ["A graph traversal algorithm", "A sorting algorithm", "A search algorithm", "A data structure"],
        correctAnswerIndex: 0,
        explanation: "Breadth-first search is a graph traversal algorithm that explores all vertices at the present depth before moving to vertices at the next depth level.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is the time complexity of DFS and BFS?",
        options: ["O(1)", "O(log n)", "O(n)", "O(V + E)"],
        correctAnswerIndex: 3,
        explanation: "Both DFS and BFS have time complexity O(V + E) where V is the number of vertices and E is the number of edges.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is a priority queue?",
        options: ["A queue where elements have priorities", "A regular queue", "A stack", "A tree"],
        correctAnswerIndex: 0,
        explanation: "A priority queue is a queue where elements are removed based on priority rather than the order they were added.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is the time complexity of heap operations?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswerIndex: 1,
        explanation: "Heap operations like insert and delete have O(log n) time complexity as they maintain the heap property.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is a trie data structure?",
        options: ["A tree data structure for strings", "A linear data structure", "A graph structure", "A hash table"],
        correctAnswerIndex: 0,
        explanation: "A trie is a tree data structure used to store and retrieve strings, where each node represents a character.",
        category: "Programming Concepts"
    },
    {
        questionText: "What is the time complexity of trie operations?",
        options: ["O(1)", "O(log n)", "O(n)", "O(m)"],
        correctAnswerIndex: 3,
        explanation: "Trie operations have time complexity O(m) where m is the length of the string being searched or inserted.",
        category: "Programming Concepts"
    }
];

// Initialize Test Function
function initializeTest(category, questionCount) {
    console.log('Initializing test with category:', category, 'and question count:', questionCount);
    currentTestCategory = category; // Store the current category
    let selectedQuestions = [];
    
    if (category === 'Mixed Practice Test') {
        const allQuestions = [...logicalReasoningQuestions, ...quantitativeAptitudeQuestions, ...verbalAbilityQuestions, ...programmingConceptsQuestions, ...databaseSqlQuestions];
        selectedQuestions = getRandomQuestions(allQuestions, questionCount);
    } else if (category === 'Logical Reasoning') {
        selectedQuestions = getRandomQuestions(logicalReasoningQuestions, questionCount);
    } else if (category === 'Quantitative Aptitude') {
        selectedQuestions = getRandomQuestions(quantitativeAptitudeQuestions, questionCount);
    } else if (category === 'Verbal Ability') {
        selectedQuestions = getRandomQuestions(verbalAbilityQuestions, questionCount);
    } else if (category === 'Programming Concepts') {
        selectedQuestions = getRandomQuestions(programmingConceptsQuestions, questionCount);
    } else if (category === 'Database & SQL') {
        selectedQuestions = getRandomQuestions(databaseSqlQuestions, questionCount);
    } else {
        selectedQuestions = getRandomQuestions(logicalReasoningQuestions, questionCount);
    }
    
    questions = selectedQuestions;
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    timerSeconds = 0;
    
    if (document.getElementById('test-category-title')) {
        document.getElementById('test-category-title').textContent = category;
    }
    
    startTimer();
    createQuestionNavigator();
    displayQuestion();
    updateNavigation();
}

function getRandomQuestions(questionPool, count) {
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

function startTimer() {
    if (timeDisplay) {
        timeInterval = setInterval(() => {
            timerSeconds++;
            const minutes = Math.floor(timerSeconds / 60);
            const seconds = timerSeconds % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
}

function displayQuestion() {
    if (!questions || questions.length === 0 || !questionTextElement) return;
    
    const question = questions[currentQuestionIndex];
    questionTextElement.textContent = question.questionText;
    
    if (questionCountElement) {
        questionCountElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    }
    
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
             const optionWrapper = document.createElement('div');
             optionWrapper.className = 'option-wrapper';

             const optionInput = document.createElement('input');
             optionInput.type = 'radio';
             optionInput.name = 'question_' + currentQuestionIndex; // Unique name for each question
             optionInput.id = 'option_' + index;
             optionInput.className = 'option-radio';

              const optionLabel = document.createElement('label');
            optionLabel.htmlFor = 'option_' + index;
            optionLabel.textContent = option;
            optionLabel.className = 'option-label';
            
            optionInput.addEventListener('change', () => selectOption(index));
             // Check if this option was previously selected
            if (userAnswers[currentQuestionIndex] === index) {
                optionInput.checked = true;
            }
            
            optionWrapper.appendChild(optionInput);
            optionWrapper.appendChild(optionLabel);
            optionsContainer.appendChild(optionWrapper);
            // **CHANGE ENDS HERE**
        });
    }
    
    updateAnsweredCount();
}

function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    if (optionsContainer) {
        const optionButtons = optionsContainer.querySelectorAll('.option-btn');
        optionButtons.forEach((btn, index) => {
            btn.classList.toggle('selected', index === optionIndex);
        });
    }
    
    updateQuestionNavigator();
    updateAnsweredCount();
    updateNavigation();
}

function createQuestionNavigator() {
    if (!navigatorGrid) return;
    
    navigatorGrid.innerHTML = '';
    
    for (let i = 0; i < questions.length; i++) {
        const navButton = document.createElement('button');
        navButton.className = 'nav-question-btn';
        navButton.textContent = i + 1;
        navButton.addEventListener('click', () => goToQuestion(i));
        navigatorGrid.appendChild(navButton);
    }
    
    updateQuestionNavigator();
}

function updateQuestionNavigator() {
    if (!navigatorGrid) return;
    
    const navButtons = navigatorGrid.querySelectorAll('.nav-question-btn');
    navButtons.forEach((btn, index) => {
        btn.classList.remove('current', 'answered');
        
        if (index === currentQuestionIndex) {
            btn.classList.add('current');
        }
        
        if (userAnswers[index] !== null) {
            btn.classList.add('answered');
        }
    });
}

function goToQuestion(questionIndex) {
    currentQuestionIndex = questionIndex;
    displayQuestion();
    updateNavigation();
    updateQuestionNavigator();
}

function updateAnsweredCount() {
    if (answeredCountElement) {
        const answeredCount = userAnswers.filter(answer => answer !== null).length;
        answeredCountElement.textContent = `${answeredCount} of ${questions.length} answered`;
    }
}

function updateNavigation() {
    if (prevBtn) {
        prevBtn.style.display = currentQuestionIndex > 0 ? 'flex' : 'none';
    }
    
    if (currentQuestionIndex === questions.length - 1) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitTestBtn) submitTestBtn.style.display = 'block';
    } else {
        if (nextBtn) nextBtn.style.display = 'flex';
        if (submitTestBtn) submitTestBtn.style.display = 'none';
    }
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        updateNavigation();
        updateQuestionNavigator();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        updateNavigation();
        updateQuestionNavigator();
    }
}

function reviewAnswers() {
    window.location.href = "review.html"; // you'll create this page
}


function submitTest() {
    if (timeInterval) {
        clearInterval(timeInterval);
    }
    
    let correctAnswers = 0;
    let attemptedQuestions = 0;

    questions.forEach((question, index) => {
        if (userAnswers[index] !== null) {
            attemptedQuestions++;
            if (userAnswers[index] === question.correctAnswerIndex) {
                correctAnswers++;
            }
        }
    });

    const totalQuestions = questions.length;
    const incorrectAnswers = attemptedQuestions - correctAnswers;
    const unattemptedQuestions = totalQuestions - attemptedQuestions;

    // Score based on total questions
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Accuracy only for attempted ones
    const accuracyPercentage = attemptedQuestions > 0
        ? Math.round((correctAnswers / attemptedQuestions) * 100)
        : 0;

    const timeSpentMinutes = Math.floor(timerSeconds / 60);
    const timeSpentSeconds = timerSeconds % 60;

    const avgTimePerQuestion = attemptedQuestions > 0
        ? Math.round(timerSeconds / attemptedQuestions)
        : 0;

    // Update UI
    if (finalScorePercentage) finalScorePercentage.textContent = `${scorePercentage}%`;
    if (totalQuestionsStat) totalQuestionsStat.textContent = totalQuestions;
    if (correctAnswersStat) correctAnswersStat.textContent = correctAnswers;
    if (incorrectAnswersStat) incorrectAnswersStat.textContent = incorrectAnswers;
    if (timeSpentStat) timeSpentStat.textContent = `${timeSpentMinutes}m ${timeSpentSeconds}s`;
    if (analysisAccuracy) analysisAccuracy.textContent = `${accuracyPercentage}%`;
    if (analysisAvgTime) analysisAvgTime.textContent = `${avgTimePerQuestion}s`;

    // Show result screen immediately
    if (testArea) testArea.style.display = 'none';
    if (resultScreen) resultScreen.style.display = 'block';

    // Save test result to localStorage for performance dashboard
    const testResult = {
        category: document.getElementById('test-category-title').textContent,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        incorrectAnswers: incorrectAnswers,
        timeSpent: timerSeconds,
        score: scorePercentage,
        date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }),
        status: "Completed"
    };

    // Save current test result
    localStorage.setItem('currentTestResult', JSON.stringify(testResult));
    
    // Save to test history for performance dashboard
    let history = JSON.parse(localStorage.getItem('testHistory')) || [];
    history.unshift(testResult); // Add to beginning of array
    
    // Keep only last 20 entries to avoid clutter
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    localStorage.setItem('testHistory', JSON.stringify(history));

    // Save review data
    localStorage.setItem('reviewData', JSON.stringify({
        questions: questions,
        userAnswers: userAnswers
    }));

    console.log('Test completed! Results saved to localStorage:', testResult);
    console.log('Updated test history:', history);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Test navigation buttons
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (prevBtn) prevBtn.addEventListener('click', previousQuestion);
    if (submitTestBtn) submitTestBtn.addEventListener('click', submitTest);
    
    // Start test buttons
    const startTestButtons = document.querySelectorAll('.start-test-btn');
    startTestButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.getAttribute('data-category');
            localStorage.setItem('selectedCategory', category);
            localStorage.setItem('questionCount', '30');
            window.location.href = 'test.html';
        });
    });
    
    // Quick action buttons
    const actionButtons = document.querySelectorAll('.action-btn[data-category]');
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.getAttribute('data-category');
            localStorage.setItem('selectedCategory', category);
            localStorage.setItem('questionCount', '10');
            window.location.href = 'test.html';
        });
    });

    // Review answers button
    const reviewAnswersBtn = document.getElementById('review-answers-btn');
    if (reviewAnswersBtn) {
        reviewAnswersBtn.addEventListener('click', () => {
            console.log("Review Answers button clicked! Logic to review answers will be implemented here.");
            alert("Navigating to the Review Answers page/section.");
        });
    }
});








    









// Function to save a new test result to localStorage
function saveTestResult(testCategory, correctCount, incorrectCount, totalQuestions, timeTaken) {
    // Get existing history or start a new empty array
    let history = JSON.parse(localStorage.getItem('testHistory')) || [];

    // Calculate score percentage
    const scorePercentage = ((correctCount / totalQuestions) * 100).toFixed(0) + '%';
    
    // Create the new history entry
    const newEntry = {
        category: testCategory,
        score: scorePercentage,
        timeSpent: timeTaken,
        status: 'Completed',
        date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    };

    // Add the new entry to the beginning of the array
    history.unshift(newEntry);

    // Keep only the last 10 entries to avoid clutter
    if (history.length > 10) {
        history = history.slice(0, 10);
    }

    // Save the updated history back to local storage
    localStorage.setItem('testHistory', JSON.stringify(history));
}

// Example of how you would call this function after a test is completed:
// After the results are calculated on your result.html page, you would call:
// saveTestResult(
//     'Quantitative Aptitude', // Replace with the actual test category
//     correctAnswersStat,    // Replace with the actual correct count variable
//     incorrectAnswersStat,  // Replace with the actual incorrect count variable
//     totalQuestionsStat,    // Replace with the actual total questions variable
//     timeSpentStat          // Replace with the actual time spent variable
// );







