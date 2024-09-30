import { inject, Injectable, input } from '@angular/core';
import {
  Project,
  ProjectsRepository,
  ProjectView,
  projectViewsEntitiesRef,
} from '../../../state/projects/projects.repository';
import { getAllEntitiesApply, getEntity, upsertEntities } from '@ngneat/elf-entities';
import { Widget, WidgetsRepository } from '../../../state/widgets/widgets.repository';

enum MockedValuesIds {
  projectId = '%%PROJECT_ID%%',
}

@Injectable({ providedIn: 'root' })
export class ImportExportService {
  projectsRepository: ProjectsRepository = inject(ProjectsRepository);
  widgetsRepository: WidgetsRepository = inject(WidgetsRepository);

  private async importTemplateFile(): Promise<string> {
    const inputFile: HTMLInputElement = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = '.json';
    inputFile.click();

    await new Promise((resolve, reject) => {
      inputFile.oninput = input => resolve(input);
      inputFile.onerror = err => reject(err);
    });

    const file: File = inputFile.files![0];
    return file.text().then(text => {
      inputFile.remove();
      return text;
    });
  }

  private async saveTemplateAsFile(filename: string, dataObjToWrite: object) {
    const blob = new Blob([JSON.stringify(dataObjToWrite, null, 2)], { type: 'text/json' });
    const link = document.createElement('a');

    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset['downloadurl'] = ['text/json', link.download, link.href].join(':');

    const evt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(evt);
    link.remove();
  }

  async importView(projectId: Project['_id']): Promise<void> {
    const data: string = await this.importTemplateFile();
    const parsedData = JSON.parse(data) as { projectView?: ProjectView; widgets?: Widget[] };
    if (typeof parsedData.widgets === 'undefined' || typeof parsedData.projectView === 'undefined')
      throw new Error(`Data to import is missing one of the parameters`);

    parsedData.projectView._id = crypto.randomUUID();
    parsedData.projectView.projectId = projectId;
    parsedData.widgets = parsedData.widgets.map(w => ({
      ...w,
      _id: crypto.randomUUID(),
      project: parsedData.projectView!.projectId,
      projectView: parsedData.projectView!._id,
    }));
    parsedData.projectView.widgets = parsedData.widgets!.map(w => w._id);

    this.projectsRepository.store.update(upsertEntities([parsedData.projectView], { ref: projectViewsEntitiesRef }));
    this.widgetsRepository.store.update(upsertEntities(parsedData.widgets));
  }

  async exportView(id: ProjectView['_id'], opts: { removeSourceAccount?: boolean } = {}): Promise<void> {
    const projectView: ProjectView | undefined = this.projectsRepository.store.query(
      getEntity(id, { ref: projectViewsEntitiesRef })
    );

    if (!projectView) throw new Error(`The project view ${id} doesn't exist`);

    const widgets: Widget[] = this.widgetsRepository.store.query(
      getAllEntitiesApply({
        filterEntity: entity => entity.projectView === id,
        mapEntity: entity => ({
          ...entity,
          project: MockedValuesIds.projectId,
          source: opts.removeSourceAccount ? undefined : entity.source,
        }),
      })
    );

    await this.saveTemplateAsFile(`projectView_${id}.json`, { projectView, widgets });
  }
}
