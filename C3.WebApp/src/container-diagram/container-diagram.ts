import {autoinject} from 'aurelia-framework';
import {Container as DIContainer} from 'aurelia-dependency-injection';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DiagramBase} from '../common/diagram-base';
import {NodeBase} from '../common/node-base';
import {EdgeBase} from '../common/edge-base';
import {ContainerNode} from './container-node';
import {SelectionBox} from '../common/selection-box';
import {ContainerDiagram} from '../common/model';
import {SystemContextModelService} from "../services/system-context-diagram-service";
import {ContainerDiagramService} from "../services/container-diagram-service";
import { DiagramModelChangedEventArgs } from '../nav-bar';

@autoinject
export class ContainerDiagram extends DiagramBase {
    id: string;
    name: string;
    private containerNodes: ContainerNode[];
    private diagramElement: SVGElement;
    
    constructor(private eventAggregator: EventAggregator,
                private systemContextDiagramService: SystemContextModelService,
                private containerDiagramService: ContainerDiagramService) {
        super();
    };
    
    activate(params): void {
        this.systemContextDiagramService.getAll().then(diagrams => {
            let systemContextDiagramModel = diagrams.find(d => d.systems.i === params.systemContextDiagramId);            
            this.containerDiagramService.getAll()
                .then(diagrams => {
                    let containerDiagramModel = diagrams.find(m => m.id === params.id);
                    this.updateFromModel(containerDiagramModel);
                    this.updateEdgePaths();

                    let eventArgs = new DiagramModelChangedEventArgs(systemContextDiagramModel, containerDiagramModel);
                    this.eventAggregator.publish("DiagramModelChanged", eventArgs);
                });
        });
    }
    
    getNodes(): NodeBase[] {
        let nodes = this.containerNodes;
        return nodes;
    }
    
    getEdges(): EdgeBase[] {
        return [];
    }
    
    updateFromModel(model: ContainerDiagram): void {
        this.id = model.id;
        this.name = model.name;
        this.containerNodes = model.containers.map(nodeModel => {
            let node = new ContainerNode();
            node.updateFromModel(nodeModel);
            return node;
        });
    }
    
    copyToModel(): ContainerDiagram {
        let model = <ContainerDiagram>{};
        model.id = this.id;
        model.name = this.name;
        model.containers = this.containerNodes.map(node => node.copyToModel());
        return model;
    }
}
