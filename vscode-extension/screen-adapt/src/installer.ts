import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";

type PackageManager = "npm" | "yarn" | "pnpm";

function detectPackageManager(root: string): PackageManager {
  if (fs.existsSync(path.join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(root, "yarn.lock"))) return "yarn";
  return "npm";
}

function isPluginInstalled(root: string): boolean {
  return fs.existsSync(path.join(root, "node_modules", "screen-adapt"));
}

function installCommand(pm: PackageManager): string {
  switch (pm) {
    case "yarn":
      return "yarn add screen-adapt";
    case "pnpm":
      return "pnpm add screen-adapt";
    default:
      return "npm install screen-adapt";
  }
}

function runInstall(command: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, _stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Checks whether the screen-adapt PostCSS plugin is installed in the current
 * workspace. If not, prompts the dev to install it. Runs once per workspace
 * session using ExtensionContext.workspaceState to avoid repeat prompts.
 */
export async function checkAndInstallPlugin(
  context: vscode.ExtensionContext
): Promise<void> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return;
  }

  const root = folders[0].uri.fsPath;
  const stateKey = `screen-adapt.checkedInstall.${root}`;

  // Only prompt once per workspace session.
  if (context.workspaceState.get<boolean>(stateKey)) {
    return;
  }

  await context.workspaceState.update(stateKey, true);

  if (isPluginInstalled(root)) {
    return;
  }

  const pm = detectPackageManager(root);
  const cmd = installCommand(pm);

  const choice = await vscode.window.showInformationMessage(
    "Screen Adapt requires the PostCSS plugin to compile your CSS. Install screen-adapt to your project?",
    "Yes",
    "No"
  );

  if (choice !== "Yes") {
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Installing screen-adapt via ${pm}…`,
      cancellable: false,
    },
    async () => {
      try {
        await runInstall(cmd, root);
        vscode.window.showInformationMessage(
          "screen-adapt installed successfully."
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(
          `Failed to install screen-adapt: ${message}. Run \`${cmd}\` manually in your project root.`
        );
      }
    }
  );
}