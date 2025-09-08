---
title: "bashrc配置"
pubDate: "2025-07-28T14:00"
updatedDate: "2025-09-08T11:35"
tags: ["bash"]
category: "技术向"
---

## bashrc配置

```bash
################################################################################
if [[ $COLORTERM =~ truecolor|24bit ]]; then
  RED='\033[38;5;210m'
  GREEN='\033[38;5;121m'
  YELLOW='\033[38;5;222m'
  BLUE='\033[38;5;111m'
  MAGENTA='\033[38;5;218m'
  CYAN='\033[38;5;123m'
  WHITE='\033[38;5;15m'
  RESET='\033[0m'
else
  RED='\033[1;31m'
  GREEN='\033[1;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[1;34m'
  MAGENTA='\033[1;35m'
  CYAN='\033[1;36m'
  WHITE='\033[1;37m'
  RESET='\033[0m'
fi

function prompt_func() {
  local EXIT_CODE=$?

  [ -n "$CONDA_PROMPT_MODIFIER" ] && PS1="${CONDA_PROMPT_MODIFIER}\n" || PS1=""
  [ $EXIT_CODE -eq 0 ] && PS1+="${GREEN}●${RESET}" || PS1+="${RED}●${RESET}"

  PS1+=" ${BLUE}\u${RESET}@${GREEN}\H${RESET} in ${MAGENTA}\w${RESET} [${CYAN}$(date +%H:%M:%S)${RESET}] ${VIRTUAL_ENV_PROMPT}\n> "
}

PROMPT_COMMAND='prompt_func'

################################################################################
HISTCONTROL=ignoredups:ignorespace

# https://www.gnu.org/software/bash/manual/html_node/Readline-Init-File-Syntax.html
bind 'TAB:menu-complete'
bind 'set menu-complete-display-prefix on'
bind 'set completion-ignore-case on'
bind 'set show-all-if-ambiguous on'

alias hfmr='export HF_ENDPOINT=https://hf-mirror.com'
alias hfof='export TRANSFORMERS_OFFLINE=1 HF_DATASETS_OFFLINE=1 HF_HUB_OFFLINE=1'
alias hfofu='unset HF_ENDPOINT TRANSFORMERS_OFFLINE HF_DATASETS_OFFLINE HF_HUB_OFFLINE'

alias vpn='export https_proxy=http://127.0.0.1:7890; export http_proxy=http://127.0.0.1:7890'
alias vus='unset https_proxy; unset http_proxy'

alias xcp="rsync -ah --partial --info=progress2,stats --exclude='*~' --exclude=__pycache__"

cuda() {
  if [ -n "$*" ]; then
    export CUDA_VISIBLE_DEVICES="$*"
  else
    echo "CUDA_VISIBLE_DEVICES=${CUDA_VISIBLE_DEVICES}"
  fi
}

nv() {
  nvidia-smi --query-gpu=index,utilization.gpu,memory.free,memory.total --format=csv
}

export NO_PROXY='osa.moe,localhost,127.0.0.1,::1'
```
