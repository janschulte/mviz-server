import { Dataset, Datasets, DistributionType } from './../shared/dataset';

export abstract class DatasetProvider {
    public abstract getDatasets(searchTerm: string, distributionTypes: DistributionType[], limit: number, offset: number): Datasets;
    public abstract getDataset(id: string): Dataset;
    public abstract getLastHarvestTime(): Date;
}
