import { Injectable } from '@angular/core';
import { ProjectsRepository, ProjectView } from '../../../state/projects/projects.repository';
import { AddNewWidgetComponent } from '../../../shared/modals/add-new-widget/add-new-widget.component';
import { MatDialog } from '@angular/material/dialog';
import { Widget } from '../../../state/widgets/widgets.repository';

@Injectable({
  providedIn: 'root',
})
export class WidgetsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly matDialog: MatDialog
  ) {}

  openAddNewWidget(params: { projectView: ProjectView }) {
    this.matDialog.open(AddNewWidgetComponent, { hasBackdrop: true, data: params });
  }

  editWidget(params: { widget: Widget }) {
    this.matDialog.open(AddNewWidgetComponent, {
      hasBackdrop: true,
      data: {
        widget: params.widget,
        projectView: this.projectsRepository.store.state.projectViewsEntities[params.widget.projectView],
      },
    });
  }
}
