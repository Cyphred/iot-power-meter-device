#!/bin/bash

# Name of the tmux session
session_name="monitoring"

log_root=/root/.pm2/logs

echo "" > $log_root/arduino-out.log
echo "" > $log_root/arduino-error.log
echo "" > $log_root/daemon-out.log
echo "" > $log_root/daemon-error.log

# Start a new tmux session with the specified name
tmux new-session -d -s "$session_name"

# Split the window into four horizontal panes
tmux split-window -t "$session_name:0.0" -h
tmux split-window -t "$session_name:0.0" -h
tmux split-window -t "$session_name:0.0" -h

# Select the first pane and run 'tail' command
tmux send-keys -t "$session_name:0.0" "tail -f $log_root/arduino-out.log" C-m

# Select the second pane and run 'tail' command
tmux send-keys -t "$session_name:0.1" "tail -f $log_root/arduino-error.log" C-m

# Select the third pane and run 'tail' command
tmux send-keys -t "$session_name:0.2" "tail -f $log_root/daemon-out.log" C-m

# Select the fourth pane and run 'tail' command
tmux send-keys -t "$session_name:0.3" "tail -f $log_root/daemon-error.log" C-m
