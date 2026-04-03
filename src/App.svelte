<script>
  import Starfield from './lib/components/Starfield.svelte';
  import StartScreen from './lib/components/StartScreen.svelte';
  import GameHUD from './lib/components/GameHUD.svelte';
  import GameArea from './lib/components/GameArea.svelte';
  import LevelTransition from './lib/components/LevelTransition.svelte';
  import LevelUpScreen from './lib/components/LevelUpScreen.svelte';
  import GameOverScreen from './lib/components/GameOverScreen.svelte';
  import WinScreen from './lib/components/WinScreen.svelte';
  import CustomWordsScreen from './lib/components/CustomWordsScreen.svelte';
  import LandingScreen from './lib/components/LandingScreen.svelte';
  import TrainingUserPicker from './lib/components/training/TrainingUserPicker.svelte';
  import TrainingHome from './lib/components/training/TrainingHome.svelte';
  import TrainingLesson from './lib/components/training/TrainingLesson.svelte';
  import TrainingComplete from './lib/components/training/TrainingComplete.svelte';
</script>

<Starfield />
<LandingScreen />
<GameHUD />
<GameArea />
<LevelTransition />
<StartScreen />
<LevelUpScreen />
<GameOverScreen />
<WinScreen />
<CustomWordsScreen />
<TrainingUserPicker />
<TrainingHome />
<TrainingLesson />
<TrainingComplete />
