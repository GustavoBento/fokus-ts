interface Tarefa {
  descricao: string;
  concluida: boolean;
}

interface EstadoAplicacao {
  tarefas: Tarefa[];
  tarefaSelecionada: Tarefa | null;
  editando: boolean;
}

let estadoInicial: EstadoAplicacao = {
  tarefas: [
    {
      descricao: "Tarefa concluída",
      concluida: true,
    },
    {
      descricao: "Tarefa pendente 1",
      concluida: false,
    },
    {
      descricao: "Tarefa pendente 2",
      concluida: false,
    },
  ],
  tarefaSelecionada: null,
  editando: false,
};

const selecionarTarefa = (
  estado: EstadoAplicacao,
  tarefa: Tarefa
): EstadoAplicacao => {
  return {
    ...estado,
    tarefaSelecionada: tarefa === estado.tarefaSelecionada ? null : tarefa,
  };
};

const adicionarTarefa = (
  estado: EstadoAplicacao,
  tarefa: Tarefa
): EstadoAplicacao => {
  
  return { ...estado, tarefas: [...estado.tarefas, tarefa] };
};

const editarTarefa = (
  estado: EstadoAplicacao,
  tarefa: Tarefa
): EstadoAplicacao => {
  return { ...estado, editando: !estado.editando, tarefaSelecionada: tarefa };
};

const atualizarTarefa = (estado: EstadoAplicacao, tarefa: Tarefa): EstadoAplicacao => {
  if (estado.editando && estado.tarefaSelecionada) {
    const tarefas = estado.tarefas.map((t) => t === estado.tarefaSelecionada ? {...t, descricao: tarefa.descricao}: t)
    return {...estado, tarefas, tarefaSelecionada: null, editando: false};
  } else {
    return estado;
  }
}

const deletarTarefa = (estado: EstadoAplicacao): EstadoAplicacao => {
  if (estado.tarefaSelecionada) {
    const tarefas = estado.tarefas.filter((t) => t != estado.tarefaSelecionada);
    return { ...estado, tarefas, tarefaSelecionada: null, editando: false };
  } else {
    return estado;
  }
};

const deletarConcluidas = (estado: EstadoAplicacao): EstadoAplicacao => {
  const tarefas = estado.tarefas.filter((t) => !t.concluida);
  return { ...estado, tarefas, tarefaSelecionada: null, editando: false };
};

const deletarTodas = (estado: EstadoAplicacao): EstadoAplicacao => {
  return { ...estado, tarefas: [], tarefaSelecionada: null, editando: false };
};

const atualizarUI = () => {
  const taskIconSvg = `
    <svg class="app__section-task-icon-status" width="24" height="24" viewBox="0 0 24 24"
    fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#FFF" />
    <path
        d="M9 16.1719L19.5938 5.57812L21 6.98438L9 18.9844L3.42188 13.4062L4.82812 12L9 16.1719Z"
        fill="#01080E" />
    </svg>
    `;
  const ulLista: HTMLElement = document.querySelector(".app__section-task-list") as HTMLElement;
  const formAdicionarTarefa: HTMLFormElement = document.querySelector(".app__form-add-task") as HTMLFormElement;
  const btnAdicionarTarefa: HTMLButtonElement = document.querySelector(".app__button--add-task") as HTMLButtonElement;
  const btnCancelarTarefa: HTMLButtonElement = document.querySelector(".app__form-footer__button--cancel") as HTMLButtonElement;
  const textarea: HTMLTextAreaElement = document.querySelector(".app__form-textarea") as HTMLTextAreaElement;
  const btnDeletar: HTMLButtonElement = document.querySelector(".app__form-footer__button--delete") as HTMLButtonElement;
  const btnDeletarConcluidas: HTMLButtonElement = document.querySelector("#btn-remover-concluidas") as HTMLButtonElement;
  const btnDeletarTodas: HTMLButtonElement = document.querySelector("#btn-remover-todas") as HTMLButtonElement;
  const labelAtiva: HTMLElement = document.querySelector(".app__section-active-task-description") as HTMLElement;

  btnAdicionarTarefa.onclick = () => {
    formAdicionarTarefa.classList.toggle("hidden");
  };

  btnCancelarTarefa.onclick = () => {
    formAdicionarTarefa.classList.add("hidden");
  };

  btnDeletar.onclick = () => {
    estadoInicial = deletarTarefa(estadoInicial);
    atualizarUI();
  };

  btnDeletarConcluidas.onclick = () => {
    estadoInicial = deletarConcluidas(estadoInicial);
    atualizarUI();
  };

  btnDeletarTodas.onclick = () => {
    estadoInicial = deletarTodas(estadoInicial);
    atualizarUI();
  };

  formAdicionarTarefa.onsubmit = (evento) => {
    evento.preventDefault();
    const descricao = textarea.value;
    if (estadoInicial.editando && estadoInicial.tarefaSelecionada) {
      estadoInicial = atualizarTarefa(estadoInicial, {descricao, concluida: false})
    } else {
      estadoInicial = adicionarTarefa(estadoInicial, {
        descricao,
        concluida: false,
      });
    }
    
    textarea.value = "";
    formAdicionarTarefa.classList.add("hidden");
    atualizarUI();
  };

  labelAtiva.textContent =
    estadoInicial.tarefaSelecionada &&
    !estadoInicial.tarefaSelecionada.concluida
      ? estadoInicial.tarefaSelecionada.descricao
      : null;

  if (
    estadoInicial.editando &&
    estadoInicial.tarefaSelecionada &&
    !estadoInicial.tarefaSelecionada.concluida
  ) {
    formAdicionarTarefa.classList.remove("hidden");
    textarea.value = estadoInicial.tarefaSelecionada.descricao;
  } else {
    formAdicionarTarefa.classList.add("hidden");
  }

  if (ulLista) {
    ulLista.innerHTML = "";
  }

  estadoInicial.tarefas.forEach((tarefa) => {
    const li = document.createElement("li");
    li.classList.add("app__section-task-list-item");

    const svgIcon = document.createElement("svg");
    svgIcon.innerHTML = taskIconSvg;

    const paragraph = document.createElement("p");
    paragraph.classList.add("app__section-task-list-item-description");
    paragraph.textContent = tarefa.descricao;

    const button = document.createElement("button");
    button.classList.add("app_button-edit");

    const editIcon = document.createElement("img");
    editIcon.setAttribute("src", "/imagens/edit.png");

    button.appendChild(editIcon);

    if (tarefa.concluida) {
      button.setAttribute("disabled", "true");
      li.classList.add("app__section-task-list-item-complete");
    }

    if (tarefa === estadoInicial.tarefaSelecionada && !estadoInicial.tarefaSelecionada.concluida) {
      li.classList.add("app__section-task-list-item-active");
    }

    li.appendChild(svgIcon);
    li.appendChild(paragraph);
    li.appendChild(button);

    li.addEventListener("click", () => {
      console.log("Tarefa: ", tarefa);
      estadoInicial = selecionarTarefa(estadoInicial, tarefa);
      atualizarUI();
    });

    editIcon.onclick = (evento) => {
      if (!estadoInicial.tarefaSelecionada?.concluida) {
        evento.stopPropagation();
        estadoInicial = editarTarefa(estadoInicial, tarefa);
        atualizarUI();
      }
    };

    ulLista.appendChild(li);
  });
};

addEventListener("TarefaFinalizada", () => {
  if(estadoInicial.tarefaSelecionada) {
    estadoInicial.tarefaSelecionada.concluida = true;
    atualizarUI();
  }
})

atualizarUI();
