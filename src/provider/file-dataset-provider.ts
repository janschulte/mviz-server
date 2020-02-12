import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as cron from 'node-cron';
import { first } from 'rxjs/operators';

import { Dataset, DistributionType } from '../shared/dataset';
import { DatasetProvider } from './dataset-provider';
import { MCloudHarvester } from './m-cloud-harvester';

const DATASET_FILE_NAME = 'dataset.json';

@Injectable()
export class FileDatasetProvider implements DatasetProvider {

    private datasets: Dataset[];

    private lastHarvestTime: Date;

    constructor(
        private harvester: MCloudHarvester,
    ) {
        this.checkDatasets();
        cron.schedule('0 0 * * * *', () => this.harvestDatasets());
    }

    public getDatasets(searchTerm: string, distributionTypes: DistributionType[]) {
        let filteredSet = this.datasets;
        if (searchTerm) {
            filteredSet = filteredSet.filter(
                e => e.title.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) >= 0
                    || e.description.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) >= 0,
            );
        }
        if (distributionTypes && distributionTypes.length > 0) {
            filteredSet = filteredSet.filter(e => {
                const match = e.distributions.find(d => {
                    const idx = distributionTypes.indexOf(d.type);
                    return idx >= 0;
                });
                return !!match;
            });
        }
        return filteredSet;
    }

    public getLastHarvestTime(): Date {
        return this.lastHarvestTime;
    }

    public getDataset(id: string): Dataset {
        const dataset = this.datasets.find(e => e.id === id);
        return dataset;
    }

    private checkDatasets() {
        if (fs.existsSync(DATASET_FILE_NAME)) {
            console.log(`Load datasets from file`);
            const rawData = fs.readFileSync(DATASET_FILE_NAME, 'utf-8');
            this.datasets = JSON.parse(rawData);
            this.setUpdateTime();
        } else {
            this.harvestDatasets();
        }
    }

    private harvestDatasets() {
        console.log(`Harvest datasets`);
        this.harvester.getDatasets().pipe(first()).subscribe(res => {
            this.datasets = res;
            fs.writeFileSync(DATASET_FILE_NAME, JSON.stringify(this.datasets));
            this.setUpdateTime();
        });
    }

    private setUpdateTime() {
        this.lastHarvestTime = fs.statSync(DATASET_FILE_NAME).mtime;
    }
}
