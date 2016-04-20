import { CompileIdentifierMetadata, createHostComponentMeta } from './compile_metadata';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import * as o from './output/output_ast';
import { HostViewFactory } from 'angular2/src/core/linker/view';
import { MODULE_SUFFIX } from './util';
var _HOST_VIEW_FACTORY_IDENTIFIER = new CompileIdentifierMetadata({
    name: 'HostViewFactory',
    runtime: HostViewFactory,
    moduleUrl: `asset:angular2/lib/src/core/linker/view${MODULE_SUFFIX}`
});
export class SourceModule {
    constructor(moduleUrl, source) {
        this.moduleUrl = moduleUrl;
        this.source = source;
    }
}
export class NormalizedComponentWithViewDirectives {
    constructor(component, directives, pipes) {
        this.component = component;
        this.directives = directives;
        this.pipes = pipes;
    }
}
export class OfflineCompiler {
    constructor(_directiveNormalizer, _templateParser, _styleCompiler, _viewCompiler, _outputEmitter) {
        this._directiveNormalizer = _directiveNormalizer;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._outputEmitter = _outputEmitter;
    }
    normalizeDirectiveMetadata(directive) {
        return this._directiveNormalizer.normalizeDirective(directive);
    }
    compileTemplates(components) {
        if (components.length === 0) {
            throw new BaseException('No components given');
        }
        var statements = [];
        var exportedVars = [];
        var moduleUrl = _templateModuleUrl(components[0].component);
        components.forEach(componentWithDirs => {
            var compMeta = componentWithDirs.component;
            _assertComponent(compMeta);
            var compViewFactoryVar = this._compileComponent(compMeta, componentWithDirs.directives, componentWithDirs.pipes, statements);
            exportedVars.push(compViewFactoryVar);
            var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
            var compHostViewFactoryVar = this._compileComponent(hostMeta, [compMeta], [], statements);
            var hostViewFactoryVar = `hostViewFactory_${compMeta.type.name}`;
            statements.push(o.variable(hostViewFactoryVar)
                .set(o.importExpr(_HOST_VIEW_FACTORY_IDENTIFIER)
                .instantiate([o.literal(compMeta.selector), o.variable(compHostViewFactoryVar)], o.importType(_HOST_VIEW_FACTORY_IDENTIFIER, null, [o.TypeModifier.Const])))
                .toDeclStmt(null, [o.StmtModifier.Final]));
            exportedVars.push(hostViewFactoryVar);
        });
        return this._codegenSourceModule(moduleUrl, statements, exportedVars);
    }
    compileStylesheet(stylesheetUrl, cssText) {
        var plainStyles = this._styleCompiler.compileStylesheet(stylesheetUrl, cssText, false);
        var shimStyles = this._styleCompiler.compileStylesheet(stylesheetUrl, cssText, true);
        return [
            this._codegenSourceModule(_stylesModuleUrl(stylesheetUrl, false), _resolveStyleStatements(plainStyles), [plainStyles.stylesVar]),
            this._codegenSourceModule(_stylesModuleUrl(stylesheetUrl, true), _resolveStyleStatements(shimStyles), [shimStyles.stylesVar])
        ];
    }
    _compileComponent(compMeta, directives, pipes, targetStatements) {
        var styleResult = this._styleCompiler.compileComponent(compMeta);
        var parsedTemplate = this._templateParser.parse(compMeta, compMeta.template.template, directives, pipes, compMeta.type.name);
        var viewResult = this._viewCompiler.compileComponent(compMeta, parsedTemplate, o.variable(styleResult.stylesVar), pipes);
        ListWrapper.addAll(targetStatements, _resolveStyleStatements(styleResult));
        ListWrapper.addAll(targetStatements, _resolveViewStatements(viewResult));
        return viewResult.viewFactoryVar;
    }
    _codegenSourceModule(moduleUrl, statements, exportedVars) {
        return new SourceModule(moduleUrl, this._outputEmitter.emitStatements(moduleUrl, statements, exportedVars));
    }
}
function _resolveViewStatements(compileResult) {
    compileResult.dependencies.forEach((dep) => { dep.factoryPlaceholder.moduleUrl = _templateModuleUrl(dep.comp); });
    return compileResult.statements;
}
function _resolveStyleStatements(compileResult) {
    compileResult.dependencies.forEach((dep) => {
        dep.valuePlaceholder.moduleUrl = _stylesModuleUrl(dep.sourceUrl, dep.isShimmed);
    });
    return compileResult.statements;
}
function _templateModuleUrl(comp) {
    var moduleUrl = comp.type.moduleUrl;
    var urlWithoutSuffix = moduleUrl.substring(0, moduleUrl.length - MODULE_SUFFIX.length);
    return `${urlWithoutSuffix}.template${MODULE_SUFFIX}`;
}
function _stylesModuleUrl(stylesheetUrl, shim) {
    return shim ? `${stylesheetUrl}.shim${MODULE_SUFFIX}` : `${stylesheetUrl}${MODULE_SUFFIX}`;
}
function _assertComponent(meta) {
    if (!meta.isComponent) {
        throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2ZmbGluZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtaVJCaEF5RVUudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9vZmZsaW5lX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBRUwseUJBQXlCLEVBRXpCLHVCQUF1QixFQUN4QixNQUFNLG9CQUFvQjtPQUVwQixFQUFDLGFBQWEsRUFBZ0IsTUFBTSxnQ0FBZ0M7T0FDcEUsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FNbkQsS0FBSyxDQUFDLE1BQU0scUJBQXFCO09BQ2pDLEVBQUMsZUFBZSxFQUFDLE1BQU0sK0JBQStCO09BRXRELEVBQ0wsYUFBYSxFQUNkLE1BQU0sUUFBUTtBQUVmLElBQUksNkJBQTZCLEdBQUcsSUFBSSx5QkFBeUIsQ0FBQztJQUNoRSxJQUFJLEVBQUUsaUJBQWlCO0lBQ3ZCLE9BQU8sRUFBRSxlQUFlO0lBQ3hCLFNBQVMsRUFBRSwwQ0FBMEMsYUFBYSxFQUFFO0NBQ3JFLENBQUMsQ0FBQztBQUVIO0lBQ0UsWUFBbUIsU0FBaUIsRUFBUyxNQUFjO1FBQXhDLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFRO0lBQUcsQ0FBQztBQUNqRSxDQUFDO0FBRUQ7SUFDRSxZQUFtQixTQUFtQyxFQUNuQyxVQUFzQyxFQUFTLEtBQTRCO1FBRDNFLGNBQVMsR0FBVCxTQUFTLENBQTBCO1FBQ25DLGVBQVUsR0FBVixVQUFVLENBQTRCO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBdUI7SUFBRyxDQUFDO0FBQ3BHLENBQUM7QUFFRDtJQUNFLFlBQW9CLG9CQUF5QyxFQUN6QyxlQUErQixFQUFVLGNBQTZCLEVBQ3RFLGFBQTJCLEVBQVUsY0FBNkI7UUFGbEUseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFxQjtRQUN6QyxvQkFBZSxHQUFmLGVBQWUsQ0FB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LElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sSUFBSSxhQUFhLENBQUMsc0JBQXNCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxrQ0FBa0MsQ0FBQyxDQUFDO0lBQ2xHLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLFxuICBDb21waWxlUGlwZU1ldGFkYXRhLFxuICBjcmVhdGVIb3N0Q29tcG9uZW50TWV0YVxufSBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuXG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIHVuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtTdHlsZUNvbXBpbGVyLCBTdHlsZXNDb21waWxlRGVwZW5kZW5jeSwgU3R5bGVzQ29tcGlsZVJlc3VsdH0gZnJvbSAnLi9zdHlsZV9jb21waWxlcic7XG5pbXBvcnQge1ZpZXdDb21waWxlciwgVmlld0NvbXBpbGVSZXN1bHR9IGZyb20gJy4vdmlld19jb21waWxlci92aWV3X2NvbXBpbGVyJztcbmltcG9ydCB7VGVtcGxhdGVQYXJzZXJ9IGZyb20gJy4vdGVtcGxhdGVfcGFyc2VyJztcbmltcG9ydCB7RGlyZWN0aXZlTm9ybWFsaXplcn0gZnJvbSAnLi9kaXJlY3RpdmVfbm9ybWFsaXplcic7XG5pbXBvcnQge091dHB1dEVtaXR0ZXJ9IGZyb20gJy4vb3V0cHV0L2Fic3RyYWN0X2VtaXR0ZXInO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7SG9zdFZpZXdGYWN0b3J5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlldyc7XG5cbmltcG9ydCB7XG4gIE1PRFVMRV9TVUZGSVgsXG59IGZyb20gJy4vdXRpbCc7XG5cbnZhciBfSE9TVF9WSUVXX0ZBQ1RPUllfSURFTlRJRklFUiA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtcbiAgbmFtZTogJ0hvc3RWaWV3RmFjdG9yeScsXG4gIHJ1bnRpbWU6IEhvc3RWaWV3RmFjdG9yeSxcbiAgbW9kdWxlVXJsOiBgYXNzZXQ6YW5ndWxhcjIvbGliL3NyYy9jb3JlL2xpbmtlci92aWV3JHtNT0RVTEVfU1VGRklYfWBcbn0pO1xuXG5leHBvcnQgY2xhc3MgU291cmNlTW9kdWxlIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1vZHVsZVVybDogc3RyaW5nLCBwdWJsaWMgc291cmNlOiBzdHJpbmcpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBOb3JtYWxpemVkQ29tcG9uZW50V2l0aFZpZXdEaXJlY3RpdmVzIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgICAgICAgICBwdWJsaWMgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sIHB1YmxpYyBwaXBlczogQ29tcGlsZVBpcGVNZXRhZGF0YVtdKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgT2ZmbGluZUNvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGlyZWN0aXZlTm9ybWFsaXplcjogRGlyZWN0aXZlTm9ybWFsaXplcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdGVtcGxhdGVQYXJzZXI6IFRlbXBsYXRlUGFyc2VyLCBwcml2YXRlIF9zdHlsZUNvbXBpbGVyOiBTdHlsZUNvbXBpbGVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF92aWV3Q29tcGlsZXI6IFZpZXdDb21waWxlciwgcHJpdmF0ZSBfb3V0cHV0RW1pdHRlcjogT3V0cHV0RW1pdHRlcikge31cblxuICBub3JtYWxpemVEaXJlY3RpdmVNZXRhZGF0YShkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSk6XG4gICAgICBQcm9taXNlPENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YT4ge1xuICAgIHJldHVybiB0aGlzLl9kaXJlY3RpdmVOb3JtYWxpemVyLm5vcm1hbGl6ZURpcmVjdGl2ZShkaXJlY3RpdmUpO1xuICB9XG5cbiAgY29tcGlsZVRlbXBsYXRlcyhjb21wb25lbnRzOiBOb3JtYWxpemVkQ29tcG9uZW50V2l0aFZpZXdEaXJlY3RpdmVzW10pOiBTb3VyY2VNb2R1bGUge1xuICAgIGlmIChjb21wb25lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ05vIGNvbXBvbmVudHMgZ2l2ZW4nKTtcbiAgICB9XG4gICAgdmFyIHN0YXRlbWVudHMgPSBbXTtcbiAgICB2YXIgZXhwb3J0ZWRWYXJzID0gW107XG4gICAgdmFyIG1vZHVsZVVybCA9IF90ZW1wbGF0ZU1vZHVsZVVybChjb21wb25lbnRzWzBdLmNvbXBvbmVudCk7XG4gICAgY29tcG9uZW50cy5mb3JFYWNoKGNvbXBvbmVudFdpdGhEaXJzID0+IHtcbiAgICAgIHZhciBjb21wTWV0YSA9IDxDb21waWxlRGlyZWN0aXZlTWV0YWRhdGE+Y29tcG9uZW50V2l0aERpcnMuY29tcG9uZW50O1xuICAgICAgX2Fzc2VydENvbXBvbmVudChjb21wTWV0YSk7XG4gICAgICB2YXIgY29tcFZpZXdGYWN0b3J5VmFyID0gdGhpcy5fY29tcGlsZUNvbXBvbmVudChjb21wTWV0YSwgY29tcG9uZW50V2l0aERpcnMuZGlyZWN0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFdpdGhEaXJzLnBpcGVzLCBzdGF0ZW1lbnRzKTtcbiAgICAgIGV4cG9ydGVkVmFycy5wdXNoKGNvbXBWaWV3RmFjdG9yeVZhcik7XG5cbiAgICAgIHZhciBob3N0TWV0YSA9IGNyZWF0ZUhvc3RDb21wb25lbnRNZXRhKGNvbXBNZXRhLnR5cGUsIGNvbXBNZXRhLnNlbGVjdG9yKTtcbiAgICAgIHZhciBjb21wSG9zdFZpZXdGYWN0b3J5VmFyID0gdGhpcy5fY29tcGlsZUNvbXBvbmVudChob3N0TWV0YSwgW2NvbXBNZXRhXSwgW10sIHN0YXRlbWVudHMpO1xuICAgICAgdmFyIGhvc3RWaWV3RmFjdG9yeVZhciA9IGBob3N0Vmlld0ZhY3RvcnlfJHtjb21wTWV0YS50eXBlLm5hbWV9YDtcbiAgICAgIHN0YXRlbWVudHMucHVzaChcbiAgICAgICAgICBvLnZhcmlhYmxlKGhvc3RWaWV3RmFjdG9yeVZhcilcbiAgICAgICAgICAgICAgLnNldChvLmltcG9ydEV4cHIoX0hPU1RfVklFV19GQUNUT1JZX0lERU5USUZJRVIpXG4gICAgICAgICAgICAgICAgICAgICAgIC5pbnN0YW50aWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvLmxpdGVyYWwoY29tcE1ldGEuc2VsZWN0b3IpLCBvLnZhcmlhYmxlKGNvbXBIb3N0Vmlld0ZhY3RvcnlWYXIpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uaW1wb3J0VHlwZShfSE9TVF9WSUVXX0ZBQ1RPUllfSURFTlRJRklFUiwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbby5UeXBlTW9kaWZpZXIuQ29uc3RdKSkpXG4gICAgICAgICAgICAgIC50b0RlY2xTdG10KG51bGwsIFtvLlN0bXRNb2RpZmllci5GaW5hbF0pKTtcbiAgICAgIGV4cG9ydGVkVmFycy5wdXNoKGhvc3RWaWV3RmFjdG9yeVZhcik7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX2NvZGVnZW5Tb3VyY2VNb2R1bGUobW9kdWxlVXJsLCBzdGF0ZW1lbnRzLCBleHBvcnRlZFZhcnMpO1xuICB9XG5cbiAgY29tcGlsZVN0eWxlc2hlZXQoc3R5bGVzaGVldFVybDogc3RyaW5nLCBjc3NUZXh0OiBzdHJpbmcpOiBTb3VyY2VNb2R1bGVbXSB7XG4gICAgdmFyIHBsYWluU3R5bGVzID0gdGhpcy5fc3R5bGVDb21waWxlci5jb21waWxlU3R5bGVzaGVldChzdHlsZXNoZWV0VXJsLCBjc3NUZXh0LCBmYWxzZSk7XG4gICAgdmFyIHNoaW1TdHlsZXMgPSB0aGlzLl9zdHlsZUNvbXBpbGVyLmNvbXBpbGVTdHlsZXNoZWV0KHN0eWxlc2hlZXRVcmwsIGNzc1RleHQsIHRydWUpO1xuICAgIHJldHVybiBbXG4gICAgICB0aGlzLl9jb2RlZ2VuU291cmNlTW9kdWxlKF9zdHlsZXNNb2R1bGVVcmwoc3R5bGVzaGVldFVybCwgZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVzb2x2ZVN0eWxlU3RhdGVtZW50cyhwbGFpblN0eWxlcyksIFtwbGFpblN0eWxlcy5zdHlsZXNWYXJdKSxcbiAgICAgIHRoaXMuX2NvZGVnZW5Tb3VyY2VNb2R1bGUoX3N0eWxlc01vZHVsZVVybChzdHlsZXNoZWV0VXJsLCB0cnVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3Jlc29sdmVTdHlsZVN0YXRlbWVudHMoc2hpbVN0eWxlcyksIFtzaGltU3R5bGVzLnN0eWxlc1Zhcl0pXG4gICAgXTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBpbGVDb21wb25lbnQoY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSwgcGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRTdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdKTogc3RyaW5nIHtcbiAgICB2YXIgc3R5bGVSZXN1bHQgPSB0aGlzLl9zdHlsZUNvbXBpbGVyLmNvbXBpbGVDb21wb25lbnQoY29tcE1ldGEpO1xuICAgIHZhciBwYXJzZWRUZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlUGFyc2VyLnBhcnNlKGNvbXBNZXRhLCBjb21wTWV0YS50ZW1wbGF0ZS50ZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzLCBwaXBlcywgY29tcE1ldGEudHlwZS5uYW1lKTtcbiAgICB2YXIgdmlld1Jlc3VsdCA9IHRoaXMuX3ZpZXdDb21waWxlci5jb21waWxlQ29tcG9uZW50KGNvbXBNZXRhLCBwYXJzZWRUZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8udmFyaWFibGUoc3R5bGVSZXN1bHQuc3R5bGVzVmFyKSwgcGlwZXMpO1xuICAgIExpc3RXcmFwcGVyLmFkZEFsbCh0YXJnZXRTdGF0ZW1lbnRzLCBfcmVzb2x2ZVN0eWxlU3RhdGVtZW50cyhzdHlsZVJlc3VsdCkpO1xuICAgIExpc3RXcmFwcGVyLmFkZEFsbCh0YXJnZXRTdGF0ZW1lbnRzLCBfcmVzb2x2ZVZpZXdTdGF0ZW1lbnRzKHZpZXdSZXN1bHQpKTtcbiAgICByZXR1cm4gdmlld1Jlc3VsdC52aWV3RmFjdG9yeVZhcjtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfY29kZWdlblNvdXJjZU1vZHVsZShtb2R1bGVVcmw6IHN0cmluZywgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRlZFZhcnM6IHN0cmluZ1tdKTogU291cmNlTW9kdWxlIHtcbiAgICByZXR1cm4gbmV3IFNvdXJjZU1vZHVsZShcbiAgICAgICAgbW9kdWxlVXJsLCB0aGlzLl9vdXRwdXRFbWl0dGVyLmVtaXRTdGF0ZW1lbnRzKG1vZHVsZVVybCwgc3RhdGVtZW50cywgZXhwb3J0ZWRWYXJzKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3Jlc29sdmVWaWV3U3RhdGVtZW50cyhjb21waWxlUmVzdWx0OiBWaWV3Q29tcGlsZVJlc3VsdCk6IG8uU3RhdGVtZW50W10ge1xuICBjb21waWxlUmVzdWx0LmRlcGVuZGVuY2llcy5mb3JFYWNoKFxuICAgICAgKGRlcCkgPT4geyBkZXAuZmFjdG9yeVBsYWNlaG9sZGVyLm1vZHVsZVVybCA9IF90ZW1wbGF0ZU1vZHVsZVVybChkZXAuY29tcCk7IH0pO1xuICByZXR1cm4gY29tcGlsZVJlc3VsdC5zdGF0ZW1lbnRzO1xufVxuXG5cbmZ1bmN0aW9uIF9yZXNvbHZlU3R5bGVTdGF0ZW1lbnRzKGNvbXBpbGVSZXN1bHQ6IFN0eWxlc0NvbXBpbGVSZXN1bHQpOiBvLlN0YXRlbWVudFtdIHtcbiAgY29tcGlsZVJlc3VsdC5kZXBlbmRlbmNpZXMuZm9yRWFjaCgoZGVwKSA9PiB7XG4gICAgZGVwLnZhbHVlUGxhY2Vob2xkZXIubW9kdWxlVXJsID0gX3N0eWxlc01vZHVsZVVybChkZXAuc291cmNlVXJsLCBkZXAuaXNTaGltbWVkKTtcbiAgfSk7XG4gIHJldHVybiBjb21waWxlUmVzdWx0LnN0YXRlbWVudHM7XG59XG5cbmZ1bmN0aW9uIF90ZW1wbGF0ZU1vZHVsZVVybChjb21wOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpOiBzdHJpbmcge1xuICB2YXIgbW9kdWxlVXJsID0gY29tcC50eXBlLm1vZHVsZVVybDtcbiAgdmFyIHVybFdpdGhvdXRTdWZmaXggPSBtb2R1bGVVcmwuc3Vic3RyaW5nKDAsIG1vZHVsZVVybC5sZW5ndGggLSBNT0RVTEVfU1VGRklYLmxlbmd0aCk7XG4gIHJldHVybiBgJHt1cmxXaXRob3V0U3VmZml4fS50ZW1wbGF0ZSR7TU9EVUxFX1NVRkZJWH1gO1xufVxuXG5mdW5jdGlvbiBfc3R5bGVzTW9kdWxlVXJsKHN0eWxlc2hlZXRVcmw6IHN0cmluZywgc2hpbTogYm9vbGVhbik6IHN0cmluZyB7XG4gIHJldHVybiBzaGltID8gYCR7c3R5bGVzaGVldFVybH0uc2hpbSR7TU9EVUxFX1NVRkZJWH1gIDogYCR7c3R5bGVzaGVldFVybH0ke01PRFVMRV9TVUZGSVh9YDtcbn1cblxuZnVuY3Rpb24gX2Fzc2VydENvbXBvbmVudChtZXRhOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpIHtcbiAgaWYgKCFtZXRhLmlzQ29tcG9uZW50KSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENvdWxkIG5vdCBjb21waWxlICcke21ldGEudHlwZS5uYW1lfScgYmVjYXVzZSBpdCBpcyBub3QgYSBjb21wb25lbnQuYCk7XG4gIH1cbn1cbiJdfQ==