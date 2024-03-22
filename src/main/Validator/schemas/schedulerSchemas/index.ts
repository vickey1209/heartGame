import initializeGameplaySchedulerSchema from './initializeGameplaySchedulerSchema';
import roundStartTimerSchedulerSchema from "./roundStartTimerSchedulerSchema";
import initialCardPassTurnSetupTimerSchedulerSchema from "./initialCardPassTurnSetupTimerSchedulerSchema";
import playersCardPassTurnTimerSchedulerSchema from "./playersCardPassTurnTimerSchedulerSchema";
import initialUserTurnTimerSchedulerSchema from "./initialUserTurnTimerSchedulerSchema";
import cardsChangeTimerSchedulerSchema from "./cardsChangeTimerSchedulerSchema";
import winOfRoundSetupTimerSchedulerSchema from "./winOfRoundSetupTimerSchedulerSchema";
import winnerDeclareTimerSchedulerSchema from "./winnerDeclareTimerSchedulerSchema";
import initialNewRoundStartTimerSchedulerSchema from "./initialNewRoundStartTimerSchedulerSchema";

const exportObject = {
  initializeGameplaySchedulerSchema,
  roundStartTimerSchedulerSchema,
  initialCardPassTurnSetupTimerSchedulerSchema,
  playersCardPassTurnTimerSchedulerSchema,
  initialUserTurnTimerSchedulerSchema,
  cardsChangeTimerSchedulerSchema,
  winOfRoundSetupTimerSchedulerSchema,
  winnerDeclareTimerSchedulerSchema,
  initialNewRoundStartTimerSchedulerSchema
};

export = exportObject;
