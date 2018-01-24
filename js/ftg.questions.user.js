/**
 * A a few question for each user of the experiment.
 */

 var FTG = FTG || {};

 FTG.Questions = FTG.Questions || {};

 FTG.Questions.User = [
     {
         text: 'How old are you? (please answer in years)',
         input: true,
     },
     {
         text: 'What is your gender?',
         hide: true,
         options: [
             {value: 1, label: 'Male'},
             {value: 2, label: 'Female'},
             {value: 3, label: 'Other'}
         ]
     },
     {
         text: 'What is the number of hours per week that you had played any type of video game over the last year?',
         hide: true,
         options: [
             {value: 1, label: 'Never'},
             {value: 2, label: '0 to 1'},
             {value: 3, label: '1 to 3'},
             {value: 4, label: '3 to 5'},
             {value: 5, label: '5 to 10'},
             {value: 6, label: 'More than 10'}
         ]
     },
     {
         text: 'How proficient or skilled do you believe you are at playing video games?',
         hide: true,
         options: [
             {value: 1, label: 'No skill'},
             {value: 2, label: 'Not very skilled'},
             {value: 3, label: 'Moderately skilled'},
             {value: 4, label: 'Very skilled'}
         ]
     },
     {
         text: 'How familiar are puzzle games (e.g. mushroom game you just played) to you?',
         hide: true,
         options: [
             {value: 1, label: 'Unfamiliar'},
             {value: 2, label: 'Not very familiar'},
             {value: 3, label: 'Moderately familiar'},
             {value: 4, label: 'Very familiar'}
         ]
     },
     {
         text: 'How familiar are platform games (e.g. jump/slide games you just played) to you?',
         hide: true,
         options: [
             {value: 1, label: 'Unfamiliar'},
             {value: 2, label: 'Not very familiar'},
             {value: 3, label: 'Moderately familiar'},
             {value: 4, label: 'Very familiar'}
         ]
     },
     {
         text: 'How familiar are you with the game Tetris (e.g. the game with squared blocks you just played)?',
         hide: true,
         options: [
             {value: 1, label: 'Unfamiliar'},
             {value: 2, label: 'Not very familiar'},
             {value: 3, label: 'Moderately familiar'},
             {value: 4, label: 'Very familiar'}
         ]
     },
     {
         text: 'Compared to your regular/usual daily state of mind, how are you feeling today?',
         hide: true,
         options: [
             {value: 1, label: 'Unusually calm and relaxed'},
             {value: 2, label: 'A bit more calm and relaxed than usual'},
             {value: 3, label: 'Normal (calm and/or stressed as usual'},
             {value: 4, label: 'A bit more stressed than usual'},
             {value: 5, label: 'Unusually stressed'}
         ]
     },
     {
         text: 'How familiar are you with the research related to this experiment?',
         hide: true,
         options: [
             {value: 1, label: 'Unfamiliar (e.g. never heard about it)'},
             {value: 2, label: 'Not very familiar (e.g. heard something about it)'},
             {value: 3, label: 'Moderately familiar (e.g. attended a seminar/guest lecture about it)'},
             {value: 4, label: 'Very familiar (e.g. read a scientific paper or text about it)'}
         ]
     },
 ];
