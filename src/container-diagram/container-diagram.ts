import { autoinject, Container } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DiagramBase } from '../common/diagram-base';
import { NodeBase } from '../common/node-base';
import { EdgeBase } from '../common/edge-base';
import { ContainerNode } from './container-node';
import { ContainerModel, SystemModel } from '../common/model';
import { SystemContextModelService } from "../services/system-context-model-service";
import { ModelSelectionChangedEventArgs } from '../nav-bar';
import { ActorNode } from "../system-context-diagram/actor-node";
import { ExternalSystemNode } from "../system-context-diagram/external-system-node";
import { SystemNode } from "../system-context-diagram/system-node";

@autoinject
export class ContainerDiagram extends DiagramBase {
    id: string;
    actorNodes: ActorNode[];
    containerNodes: ContainerNode[];
    externalSystemNodes: ExternalSystemNode[];
    private diagramElement: SVGElement;
    private loaded: Promise<void>;

    constructor(private eventAggregator: EventAggregator,
        private container: Container,
        private systemContextModelService: SystemContextModelService) {
        super();
    };

    private load() {
        return this.systemContextModelService.get().then(system => {
            this.updateFromModel(system);
            let eventArgs = new ModelSelectionChangedEventArgs(system);
            this.eventAggregator.publish("ModelSelectionChanged", eventArgs);
        })
    }

    activate(){
        this.loaded = this.load();
    }

    attached(){
        this.loaded.then(() => {
            this.positionNodes();
            this.updateEdgePaths();
        });
    }

    private positionNodes() {
        const space = 150;

        let middleX = Math.abs(this.diagramElement.clientWidth / 2);

        let actorNodesRowWith = this.actorNodes.length * ActorNode.width + (this.actorNodes.length - 1) * space;
        let containerNodesRowWidth = this.containerNodes.length * ContainerNode.width + (this.containerNodes.length - 1) * space;
        let externalSystemNodesRowWidth = this.externalSystemNodes.length * ExternalSystemNode.width + (this.externalSystemNodes.length - 1) * space;

        var actorNodeX = Math.abs(middleX - actorNodesRowWith / 2);
        var y = 0;
        this.actorNodes.forEach(n => {
            n.x = actorNodeX;
            n.y = y;
            actorNodeX += ActorNode.width + space;
        });

        var containerNodeX = Math.abs(middleX - containerNodesRowWidth / 2);
        if (this.actorNodes.length > 0) {
            y += ActorNode.height + space;
        }
        this.containerNodes.forEach(c => {
            c.x = containerNodeX;
            c.y = y;
            containerNodeX += ContainerNode.width + space;
        });

        var externalSystemNodeX = Math.abs(middleX - externalSystemNodesRowWidth / 2);
        if (this.containerNodes.length > 0) {
            y += ExternalSystemNode.height + space;
        }
        this.externalSystemNodes.forEach(n => {
            n.x = externalSystemNodeX;
            n.y = y;
            externalSystemNodeX += ExternalSystemNode.width + space;
        });
    }

    getNodes(): NodeBase[] {
        let nodes = (<NodeBase[]>this.actorNodes)
            .concat(this.containerNodes)
            .concat(<NodeBase[]>this.externalSystemNodes);
        return nodes;
    }

    getEdges(): EdgeBase[] {
        return [];
    }

    updateFromModel(systemModel: SystemModel): void {
        this.id = systemModel.id;
        this.actorNodes = systemModel.actors
            .filter(a => systemModel.usings.some(u => u.sourceId === a.id && 
                    systemModel.containers.some(c => u.targetId === c.id)))
            .map(a => {
                let node = <ActorNode>this.container.get(ActorNode);
                node.updateFromModel(a);
                return node;
            });
        this.containerNodes = systemModel.containers.map(container => {
            let node = <ContainerNode>this.container.get(ContainerNode);
            node.updateFromModel(container);
            return node;
        });
        this.externalSystemNodes = systemModel.externalSystems
            .filter(e => systemModel.usings.some(u => u.targetId === e.id &&
                systemModel.containers.some(c => u.sourceId === c.id)))
            .map(e => {
                let node = <ExternalSystemNode>this.container.get(ExternalSystemNode);
                node.updateFromModel(e);
                return node;
            });
    }

    //TODO
    copyToModel(): SystemModel {
        let model = <SystemModel>{};
        model.id = this.id;
        model.containers = this.containerNodes.map(node => node.copyToModel());
        return model;
    }
}
