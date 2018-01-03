/**
 * A set of question to be used after a COTS game in the experiment.
 */

 var FTG = FTG || {};

 FTG.Questions = FTG.Questions || {};

 FTG.Questions.COTS = [
     {
         text: 'COTS On a scale from 1 to 5, how <em>bored</em> did you feel at the <em>beginning</em> of the game?',
         options: [
             {value: 1, label: '(Not bored at all)'},
             {value: 2, label: ''},
             {value: 3, label: ''},
             {value: 4, label: ''},
             {value: 5, label: '(Extremely bored)'}
         ]
     },
     {
         text: 'COTS On a scale from 1 to 5, how <em>stressed</em> did you feel at the <em>beginning</em> of the game?',
         options: [
             {value: 1, label: '(Not stressed at all)'},
             {value: 2, label: ''},
             {value: 3, label: ''},
             {value: 4, label: ''},
             {value: 5, label: '(Extremely stressed)'}
         ]
     },
     {
         text: 'COTS Did you understand how to play the game properly?',
         hide: true,
         options: [
             {value: 2, label: 'Yes'},
             {value: 1, label: 'Yes, but I was a bit confused'},
             {value: 0, label: 'No'}
         ]
     },
 ];
