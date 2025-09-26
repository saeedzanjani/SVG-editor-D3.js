import { signal, WritableSignal } from '@angular/core';
import { SvgElement, DialogManagerConfig } from '../models';
import { ContextMenuUtils } from './context-menu.utils';
import { MenuState } from '../models/component.models';

export class MenuUtils {
  static createMenuState(): MenuState {
    return {
      showFileMenu: signal(false),
      showEditMenu: signal(false),
      showViewMenu: signal(false)
    };
  }

  static toggleMenu(
    menuState: MenuState,
    menuType: 'file' | 'edit' | 'view'
  ): void {
    let targetMenu: WritableSignal<boolean>;

    switch (menuType) {
      case 'file':
        targetMenu = menuState.showFileMenu;
        break;
      case 'edit':
        targetMenu = menuState.showEditMenu;
        break;
      case 'view':
        targetMenu = menuState.showViewMenu;
        break;
    }

    this.closeAllMenus(menuState);
    targetMenu.update((show: boolean) => !show);
  }

  static closeAllMenus(menuState: MenuState): void {
    menuState.showFileMenu.set(false);
    menuState.showEditMenu.set(false);
    menuState.showViewMenu.set(false);
  }

  static isAnyMenuOpen(menuState: MenuState): boolean {
    return menuState.showFileMenu() ||
           menuState.showEditMenu() ||
           menuState.showViewMenu();
  }

  static getActiveMenuName(menuState: MenuState): string | null {
    if (menuState.showFileMenu()) return 'file';
    if (menuState.showEditMenu()) return 'edit';
    if (menuState.showViewMenu()) return 'view';
    return null;
  }
}

export class DialogManager {
  private config: DialogManagerConfig;

  constructor(config: DialogManagerConfig) {
    this.config = config;
  }

  openLabelCustomizationDialog(element: SvgElement): void {
    if (ContextMenuUtils.canCustomizeElement(element)) {
      this.config.signals.selectedElementForDialog.set(element);
      this.config.signals.showLabelCustomizationDialog.set(true);
    }
  }

  openLabelCustomizationDialogForNewLabel(position: { x: number; y: number }, targetElementId?: string): void {
    const tempElement: SvgElement = {
      id: 'temp-new-label',
      type: 'text' as any,
      attributes: {
        x: position.x,
        y: position.y,
        textContent: '',
        fill: '#000000',
        'font-size': 16,
        'font-family': 'Arial',
        'text-anchor': 'start'
      },
      layerId: 'default',
      visible: true,
      locked: false,
      selected: false
    };

    (tempElement as any).targetElementId = targetElementId;
    (tempElement as any).isNewLabel = true;

    this.config.signals.selectedElementForDialog.set(tempElement);
    this.config.signals.showLabelCustomizationDialog.set(true);
  }

  closeLabelCustomizationDialog(): void {
    this.config.signals.showLabelCustomizationDialog.set(false);
    this.config.signals.selectedElementForDialog.set(null);
  }

  handleLabelCustomizationSave(data: any): void {
    this.config.callbacks.onLabelCustomizationSave(data);
    this.closeLabelCustomizationDialog();
  }
}
