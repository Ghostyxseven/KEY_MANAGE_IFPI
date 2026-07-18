import { Platform } from "react-native";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { api } from "./api";

export const BACKGROUND_SYNC_TASK = "coretech-sync-pendencias";

if (Platform.OS === "android" && !TaskManager.isTaskDefined(BACKGROUND_SYNC_TASK)) {
  TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
      await api.sincronizarPendencias();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

export async function registrarSincronizacaoEmSegundoPlano(): Promise<boolean> {
  if (Platform.OS !== "android" || !(await TaskManager.isAvailableAsync())) return false;
  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) return false;
  if (!(await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK))) {
    await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, { minimumInterval: 15 });
  }
  return true;
}
