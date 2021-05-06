import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from './read-report.service';
import * as XLSX from 'xlsx';
import { AgGridAngular } from 'ag-grid-angular';
import { AllModules } from '@ag-grid-enterprise/all-modules';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-read-report',
  templateUrl: './read-report.component.html',
  styleUrls: ['./read-report.component.css']
})
export class ReadReportComponent implements OnInit {
  columnDefs = [];
  columnDefsBackup = [];
  rowData = [];
  gridApi;
  gridColumnApi;
  public modules = AllModules;
  excelStyles;
  context;
  defaultColDef;
  loaded = false;

  dropdownList = [];
  selectedItems = [];
  dropdownSettings: IDropdownSettings = {};

  @ViewChild('agGrid') agGrid: AgGridAngular;
  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loaded = false;
    this.reportService.getReport().subscribe(data => {
      this.loaded = false;
      data.gridOptions.defaultColDef.cellClassRules = {};
      data.gridOptions.defaultColDef.cellClassRules.redBackground = input => {
        let cellComparison = false;
        const tag = input.colDef.field.slice(3);
        if (!tag || input.colDef.field.startsWith('(A)')) {
          return false;
        }
        const comparison = input.context[input.colDef.field];
        cellComparison = comparison[input.context.rowDefs[input.rowIndex]];
        return !cellComparison;
      };
      data.gridOptions.excelStyles[0].font.color = '#FFFFFF';
      data.gridOptions.excelStyles[0].interior.color = '#FF0000';
      data.gridOptions.enableColResize = true;
      data.gridOptions.defaultColDef.resizable = true;
      data.gridOptions.columnDefs[0].minWidth = 200;
      data.gridOptions.columnDefs[0].maxWidth = 850;
      data.gridOptions.columnDefs[0].flex = 1;
      this.columnDefs = data.gridOptions.columnDefs;
      this.columnDefsBackup = [...data.gridOptions.columnDefs];
      this.defaultColDef = data.gridOptions.defaultColDef;
      this.rowData = data.gridOptions.rowData;
      this.excelStyles = data.gridOptions.excelStyles;
      this.context = data.gridOptions.context;

      // drop down
      this.dropdownList = [...this.columnDefs.slice(1)];
      this.dropdownSettings = {
        singleSelection: false,
        idField: 'field',
        textField: 'headerName',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 4,
        allowSearchFilter: true
      };

      this.loaded = true;
    });
  }

  saveExcelFile() {
    this.defaultColDef.cellClassRules.redBackground = input => {
      let cellComparison = false;
      const tag = input.colDef.field.slice(3);
      if (!tag || input.colDef.field.startsWith('(A)')) {
        return false;
      }
      const comparison = input.context[input.colDef.field];
      cellComparison = comparison[input.context.rowDefs[input.rowIndex - 2]];
      return !cellComparison;
    };
    const params = {
      fileName: 'Tags',
      sheetName: 'Tags'
    };
    this.gridApi.exportDataAsExcel(params);
    this.defaultColDef.cellClassRules.redBackground = input => {
      let cellComparison = false;
      const tag = input.colDef.field.slice(3);
      if (!tag || input.colDef.field.startsWith('(A)')) {
        return false;
      }
      const comparison = input.context[input.colDef.field];
      cellComparison = comparison[input.context.rowDefs[input.rowIndex]];
      return !cellComparison;
    };
  }
  onItemSelect(item: any) {
    // preserving order
    const temp2 = [];
    temp2.push(this.columnDefs[0]);
    for (let i = 1; i < this.columnDefsBackup.length; i++) {
      for (let j = 0; j < this.selectedItems.length; j++) {
        if (this.columnDefsBackup[i].field == this.selectedItems[j].field) {
          temp2.push(this.columnDefsBackup[i]);
        }
      }
    }
    this.columnDefs = [...temp2];
  }
  onSelectAll(items: any) {
    this.selectedItems = items;
    const temp = this.columnDefs[0];
    this.columnDefs = [temp, ...this.selectedItems];
  }
  onItemDeSelect(items: any) {
    // preserving order
    const temp2 = [];
    temp2.push(this.columnDefs[0]);
    for (let i = 1; i < this.columnDefsBackup.length; i++) {
      for (let j = 0; j < this.selectedItems.length; j++) {
        if (this.columnDefsBackup[i].field == this.selectedItems[j].field) {
          temp2.push(this.columnDefsBackup[i]);
        }
      }
    }
    this.columnDefs = [...temp2];
  }
  autoSizeAll(skipHeader) {
    let allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach(function(column) {
      allColumnIds.push(column.colId);
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
  }
  onGridReady(params) {
    console.log('grid ready');
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }
}
