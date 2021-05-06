import { Injectable } from '@angular/core';

// import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { environment } from '../environments/environment';

const { sasString, sas, account, accountKey } = environment;

@Injectable({
  providedIn: 'root'
})
export class BlobService {
  private blobServiceClient;

  constructor() {
    this.blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net${sas}`
    );
  }

  async main(file) {
    let containerName = 'upload-pdf';
    const fileNameSplit = file.name.split('.');
    const fileType = fileNameSplit[fileNameSplit.length - 1];
    if (fileType === 'xlsx') {
      containerName = 'upload-xlsx';
    }
    const containerClient = this.blobServiceClient.getContainerClient(
      containerName
    );
    const blobName = file.name;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
      return await blockBlobClient.uploadBrowserData(file);
    } catch (err) {
      console.log(err);
    }
  }
}
