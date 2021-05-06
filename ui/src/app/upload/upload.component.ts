import { Component, OnInit, ɵConsole } from '@angular/core';
import { BlobService } from '../blob.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { TriggerService } from '../shared/service/trigger.service';

@Component({
  selector: 'upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  constructor(private blobService: BlobService, private triggerService: TriggerService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  files: any = [];
  fileMap: any = {};

  uploadFile(event) {
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      const fileNameSplit = element.name.split('.');
      const fileType = fileNameSplit[fileNameSplit.length - 1];
      if (fileType !== 'pdf' && fileType !== 'xlsx') {
        this._snackBar.open('INCORRECT FILE TYPE: Files must be of type PDF or XLSX', '', { duration: 3500 })
        return;
      }
      this.fileMap[element.name] = element;

      this.files.push(element.name)
    }
  }
  deleteAttachment(fileName) {
    this.files.splice(this.files.indexOf(fileName), 1)[0];
    delete this.fileMap[fileName];
  }
  submit() {
    const success = [];
    const fail = [];
    this.files.map((fileName, i) => ({ fileName, res: this.blobService.main(this.fileMap[fileName]) })).forEach(async (resOutput, index) => {
      const res = await resOutput.res;
      console.log(res._response.status === 201);
      if (res._response.status === 201) {
        success.push(resOutput.fileName);
        // call trigger
        const fileNameSplit = resOutput.fileName.split('.');
        const fileType = fileNameSplit[fileNameSplit.length - 1];
        // console.log(resOutput.fileName+' '+fileType);
        if(fileType == 'pdf') {
          this.triggerService.PostTriggerPDF(resOutput.fileName).subscribe((data) => {
            console.log(data);
          });
        }
        if(fileType == 'xlsx') {
          this.triggerService.PostTriggerXLSX(resOutput.fileName).subscribe((data) => {
            console.log(data);
          });
        }
       
      } else {
        fail.push(resOutput.fileName);
      }
      this.deleteAttachment(index);
    });
    setTimeout(() => {
      const successMessage = success.reduce((output, current) => {
        output += `${current}\n`;
        return output;
      }, `Successfully uploaded files:\n`);
      const failMessage = fail.reduce((output, current) => {
        output += `${current}\n`;
        return output;
      }, `Failed uploaded files:\n`);
      if (success.length > 0) {
        this._snackBar.open(successMessage, '', { duration: 3500 });
        this._snackBar.open(successMessage, '', { duration: 3500 });
      } else if (fail.length > 0) {
        this._snackBar.open(failMessage, '', { duration: 3500 })
      }

    }, 5000)

    // console.log(this.fileMap);
    console.log('submit');
  }

}
