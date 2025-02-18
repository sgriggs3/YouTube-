# GitHub Codespaces CPU Optimization Guide

## Overview
GitHub Codespaces may report 100% CPU utilization if background processes are running unnecessarily. Use the tips below to optimize performance.

## Recommendations

- **Stop Unneeded Processes:**  
  Identify and stop file watchers, debuggers, or build processes that are not required during certain development phases.  
  - **Command Example:** Use `pkill -f <process_name>` to terminate specific processes.  
  - **Configuration Change:** Modify your development environment settings to disable automatic start of these processes.

- **Adjust Log Levels:**  
  Use lower logging levels (e.g., ERROR) in production or resource-constrained environments to reduce CPU overhead.  
  - **Configuration Change:** Edit your logging configuration file (e.g., `log4j.properties` or `logging.json`) to set the log level to ERROR or WARN.  
  - **Example:**  
    ```json
    {
      "level": "ERROR",
      "appenders": ["console"]
    }
    ```

- **Review Extensions:**  
  Disable VSCode extensions or plugins that may run resource-intensive background tasks.  
  - **Command Example:** Use the Extensions view in VSCode (`Ctrl+Shift+X`) to disable or uninstall unnecessary extensions.  
  - **Configuration Change:** Update your `settings.json` to disable extensions by default in certain projects.

- **Monitor Resource Usage:**  
  Use Codespaces’ built-in performance monitoring to pinpoint processes that consume excess CPU and consider restarting the Codespace once changes are applied.  
  - **Command Example:** Use `top` or `htop` in the terminal to monitor CPU usage.  
  - **Configuration Change:** Enable performance monitoring in your Codespace settings to receive alerts on high resource usage.

## Commands and Checks

- **Check Running Processes:**  
  Use system tools like `top`, `htop`, or VSCode’s process explorer to identify high CPU usage processes.  
  - **Example Command:** `top -o %CPU` to sort processes by CPU usage.

- **Pause/Stop File Watchers:**  
  Adjust your development tool configuration to pause or stop file watchers when not needed.  
  - **Example Configuration:** In VSCode, add the following to `settings.json` to exclude certain files from being watched:  
    ```json
    {
      "files.watcherExclude": {
        "**/node_modules/**": true,
        "**/dist/**": true
      }
    }
    ```

Following these steps should help mitigate high CPU utilization in your Codespace.