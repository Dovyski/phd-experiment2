/**
 * A set of question to be used after a COTS game in the experiment.
 */

var FTG = FTG || {};

FTG.Questions = FTG.Questions || {};

FTG.Questions.COTS_INTRO = 'Regarding the game level you just played, please answer the questions below.';
FTG.Questions.COTS = [
     {
         text: 'How <em>bored</em> did you feel while playing this game level?',
         options: [
             {value: 1, label: '(Not bored at all)'},
             {value: 2, label: ''},
             {value: 3, label: ''},
             {value: 4, label: ''},
             {value: 5, label: '(Extremely bored)'}
         ]
     },
     {
         text: 'How <em>stressed</em> did you feel while playing this game level?',
         options: [
             {value: 1, label: '(Not stressed at all)'},
             {value: 2, label: ''},
             {value: 3, label: ''},
             {value: 4, label: ''},
             {value: 5, label: '(Extremely stressed)'}
         ]
     }
];
